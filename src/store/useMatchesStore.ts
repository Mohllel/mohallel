import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabaseStorage } from '../lib/supabaseStorage'
import { applyPoint, emptyRotation, otherSide, pointSideForAction, rotateSlots } from '../lib/scoring'
import type {
  Action,
  LiveMode,
  Match,
  MatchEvent,
  Quality,
  RotationPosition,
  RotationSlot,
  ServeType,
  SkillKey,
  TeamSide,
} from '../types/domain'

const uid = () => Math.random().toString(36).slice(2, 11)

interface AddActionInput {
  side: TeamSide
  playerId: string
  skill: SkillKey
  quality: Quality
  rotationPosition?: RotationPosition
  serveType?: ServeType
  zone?: number
}

interface RotationAutoShift {
  side: TeamSide
  setNo: number
  previousSlots: RotationSlot[]
}

interface UndoRecord {
  actionId: string
  scoreSide?: TeamSide
  setIndex?: number
  setNoBefore?: number
  hadSetComplete?: boolean
  hadMatchFinish?: boolean
  rotationAutoShift?: RotationAutoShift
  servingSideBefore?: TeamSide | null
}

interface EventUndoRecord {
  eventId: string
  scoreSide?: TeamSide
  setIndex?: number
  setNoBefore?: number
  hadSetComplete?: boolean
  hadMatchFinish?: boolean
  rotationAutoShift?: RotationAutoShift
  servingSideBefore?: TeamSide | null
  substitution?: { side: TeamSide; setNo: number; position: RotationPosition; previousPlayerId: string | null }
}

/** يُعيد نتيجة تطبيق نقطة إلى ما قبلها: الدوران التلقائي، ومن كان يُرسل بذلك الشوط */
function revertPointEffects(
  match: Match,
  setNo: number,
  rotationAutoShift?: RotationAutoShift,
  servingSideBefore?: TeamSide | null,
): Match {
  let next = match
  if (rotationAutoShift) {
    const { side, previousSlots } = rotationAutoShift
    next = { ...next, rotation: { ...next.rotation, [side]: { ...next.rotation[side], [setNo]: previousSlots } } }
  }
  if (servingSideBefore !== undefined) {
    next = { ...next, servingSide: { ...(next.servingSide ?? {}), [setNo]: servingSideBefore } }
  }
  return next
}

interface MatchesActions {
  /** يحجز مباراة بتاريخ مستقبلي بلا لاعبين بعد — تظهر كـ"المباراة القادمة" بالصفحة الرئيسية */
  createScheduledMatch: (
    opponentName: string,
    opponentLogo: string | null,
    opponentPresetId: string | null,
    date: string,
    competitionId?: string | null,
    round?: string | null,
    venue?: string | null,
  ) => string
  /** يحوّل مباراة محجوزة إلى مباراة حيّة بعد اختيار لاعبي اليوم */
  startScheduledMatch: (id: string, playerIds: string[]) => void
  deleteMatch: (id: string) => void
  finishMatch: (id: string) => void

  setMode: (matchId: string, mode: LiveMode) => void
  setSet: (matchId: string, n: number) => void
  bumpScore: (matchId: string, side: TeamSide, delta: 1 | -1) => void

  addAction: (matchId: string, input: AddActionInput) => void
  undoLastAction: (matchId: string) => void
  lastAction: (matchId: string) => Action | null

  /** خريطة الملعب: نقطة بمكان سقوط الكرة (بلا مهارة) — landedInSide هو الملعب الذي سقطت فيه الكرة */
  logPointAtZone: (matchId: string, landedInSide: TeamSide, zone: number) => void
  logTimeout: (matchId: string, side: TeamSide) => void
  logChallenge: (matchId: string, side: TeamSide, result: 'won' | 'lost') => void
  substitutePlayer: (matchId: string, side: TeamSide, setNo: number, position: RotationPosition, incomingPlayerId: string) => void
  undoLastEvent: (matchId: string) => void
  lastEvent: (matchId: string) => MatchEvent | null

  assignRotation: (matchId: string, side: TeamSide, setNo: number, position: RotationPosition, playerId: string | null) => void
  rotateLineup: (matchId: string, side: TeamSide, setNo: number) => void
  getRotation: (matchId: string, side: TeamSide, setNo: number) => RotationSlot[]
  setServingSide: (matchId: string, setNo: number, side: TeamSide | null) => void
  getServingSide: (matchId: string, setNo: number) => TeamSide | null

  setLiveShareEnabled: (matchId: string, enabled: boolean) => void
  setMatchVideoUrl: (matchId: string, url: string | null) => void
  /** يضبط لحظة "الثانية صفر" بالفيديو انطلاقاً من إجراء مرجعي وثانيته الحقيقية بالفيديو */
  calibrateMatchVideo: (matchId: string, referenceTs: number, videoSecondsAtReference: number) => void
  clearMatchVideoCalibration: (matchId: string) => void
}

interface MatchesStoreState {
  matches: Record<string, Match>
  _undoIds: Record<string, string | null>
  _undoEventIds: Record<string, string | null>
}

type Store = MatchesStoreState & MatchesActions

const undoTimers: Record<string, ReturnType<typeof setTimeout>> = {}
const undoRegistry: Record<string, UndoRecord> = {}
const eventUndoTimers: Record<string, ReturnType<typeof setTimeout>> = {}
const eventUndoRegistry: Record<string, EventUndoRecord> = {}

export const useMatchesStore = create<Store>()(
  persist(
    (set, get) => ({
      matches: {},
      _undoIds: {},
      _undoEventIds: {},

      createScheduledMatch: (
        opponentName,
        opponentLogo,
        opponentPresetId,
        date,
        competitionId = null,
        round = null,
        venue = null,
      ) => {
        const id = uid()
        const match: Match = {
          id,
          createdAt: Date.now(),
          date,
          opponentName,
          opponentLogo,
          opponentPresetId,
          competitionId,
          round,
          venue,
          playerIds: [],
          mode: 'grid',
          set: 1,
          sA: [0, 0, 0, 0, 0],
          sB: [0, 0, 0, 0, 0],
          setWinners: [null, null, null, null, null],
          status: 'scheduled',
          act: [],
          events: [],
          rotation: { A: { 1: emptyRotation() }, B: { 1: emptyRotation() } },
          servingSide: {},
        }
        set((st) => ({ matches: { ...st.matches, [id]: match } }))
        return id
      },
      startScheduledMatch: (id, playerIds) =>
        set((st) => {
          const match = st.matches[id]
          if (!match || match.status !== 'scheduled') return st
          return { matches: { ...st.matches, [id]: { ...match, status: 'live', playerIds } } }
        }),
      deleteMatch: (id) =>
        set((st) => {
          const next = { ...st.matches }
          delete next[id]
          return { matches: next }
        }),
      finishMatch: (id) =>
        set((st) => {
          const match = st.matches[id]
          if (!match) return st
          return { matches: { ...st.matches, [id]: { ...match, status: 'finished' } } }
        }),

      setMode: (matchId, mode) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          return { matches: { ...st.matches, [matchId]: { ...match, mode } } }
        }),
      setSet: (matchId, n) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const rotation = {
            A: match.rotation.A[n] ? match.rotation.A : { ...match.rotation.A, [n]: emptyRotation() },
            B: match.rotation.B[n] ? match.rotation.B : { ...match.rotation.B, [n]: emptyRotation() },
          }
          return { matches: { ...st.matches, [matchId]: { ...match, set: n, rotation } } }
        }),
      bumpScore: (matchId, side, delta) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          if (delta > 0) {
            const result = applyPoint(match, side)
            return { matches: { ...st.matches, [matchId]: result.match } }
          }
          const setIndex = match.set - 1
          const key = side === 'A' ? 'sA' : 'sB'
          const arr = [...match[key]]
          arr[setIndex] = Math.max(0, arr[setIndex] - 1)
          return { matches: { ...st.matches, [matchId]: { ...match, [key]: arr } } }
        }),

      addAction: (matchId, input) => {
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const action: Action = { id: uid(), set: match.set, ts: Date.now(), ...input }
          let next: Match = { ...match, act: [...match.act, action] }

          const record: UndoRecord = { actionId: action.id }
          const pointSide = pointSideForAction(input.side, input.skill, input.quality, input.serveType)
          if (pointSide) {
            const result = applyPoint(next, pointSide)
            next = result.match
            record.scoreSide = pointSide
            record.setIndex = result.setIndex
            record.setNoBefore = result.setNoBefore
            record.hadSetComplete = result.hadSetComplete
            record.hadMatchFinish = result.hadMatchFinish
            record.rotationAutoShift = result.rotationAutoShift
            record.servingSideBefore = result.servingSideBefore
          }
          undoRegistry[matchId] = record

          return {
            matches: { ...st.matches, [matchId]: next },
            _undoIds: { ...st._undoIds, [matchId]: action.id },
          }
        })
        if (undoTimers[matchId]) clearTimeout(undoTimers[matchId])
        undoTimers[matchId] = setTimeout(() => {
          set((st) => ({ _undoIds: { ...st._undoIds, [matchId]: null } }))
        }, 3500)
      },
      undoLastAction: (matchId) => {
        const undoId = get()._undoIds[matchId]
        if (!undoId) return
        if (undoTimers[matchId]) clearTimeout(undoTimers[matchId])
        const record = undoRegistry[matchId]

        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          let next: Match = { ...match, act: match.act.filter((a) => a.id !== undoId) }

          if (record && record.actionId === undoId) {
            if (record.hadMatchFinish) next = { ...next, status: 'live' }
            if (record.hadSetComplete && record.setIndex != null && record.setNoBefore != null) {
              const setWinners = [...next.setWinners]
              setWinners[record.setIndex] = null
              next = { ...next, setWinners, set: record.setNoBefore }
            }
            if (record.scoreSide && record.setIndex != null) {
              const key = record.scoreSide === 'A' ? 'sA' : 'sB'
              const arr = [...next[key]]
              arr[record.setIndex] = Math.max(0, arr[record.setIndex] - 1)
              next = { ...next, [key]: arr }
              next = revertPointEffects(next, record.setNoBefore ?? next.set, record.rotationAutoShift, record.servingSideBefore)
            }
          }

          return { matches: { ...st.matches, [matchId]: next }, _undoIds: { ...st._undoIds, [matchId]: null } }
        })
      },
      lastAction: (matchId) => {
        const undoId = get()._undoIds[matchId]
        if (!undoId) return null
        const match = get().matches[matchId]
        return match?.act.find((a) => a.id === undoId) ?? null
      },

      logPointAtZone: (matchId, landedInSide, zone) => {
        const scoringSide = otherSide(landedInSide)
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const event: MatchEvent = { id: uid(), ts: Date.now(), set: match.set, type: 'point', side: scoringSide, zone }
          const result = applyPoint(match, scoringSide)
          const next: Match = { ...result.match, events: [...match.events, event] }
          eventUndoRegistry[matchId] = {
            eventId: event.id,
            scoreSide: scoringSide,
            setIndex: result.setIndex,
            setNoBefore: result.setNoBefore,
            hadSetComplete: result.hadSetComplete,
            hadMatchFinish: result.hadMatchFinish,
            rotationAutoShift: result.rotationAutoShift,
            servingSideBefore: result.servingSideBefore,
          }
          return { matches: { ...st.matches, [matchId]: next }, _undoEventIds: { ...st._undoEventIds, [matchId]: event.id } }
        })
        if (eventUndoTimers[matchId]) clearTimeout(eventUndoTimers[matchId])
        eventUndoTimers[matchId] = setTimeout(() => {
          set((st) => ({ _undoEventIds: { ...st._undoEventIds, [matchId]: null } }))
        }, 3500)
      },
      logTimeout: (matchId, side) => {
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const event: MatchEvent = { id: uid(), ts: Date.now(), set: match.set, type: 'timeout', side }
          eventUndoRegistry[matchId] = { eventId: event.id }
          return {
            matches: { ...st.matches, [matchId]: { ...match, events: [...match.events, event] } },
            _undoEventIds: { ...st._undoEventIds, [matchId]: event.id },
          }
        })
        if (eventUndoTimers[matchId]) clearTimeout(eventUndoTimers[matchId])
        eventUndoTimers[matchId] = setTimeout(() => {
          set((st) => ({ _undoEventIds: { ...st._undoEventIds, [matchId]: null } }))
        }, 3500)
      },
      logChallenge: (matchId, side, result) => {
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const event: MatchEvent = { id: uid(), ts: Date.now(), set: match.set, type: 'challenge', side, challengeResult: result }
          let next: Match = match
          const record: EventUndoRecord = { eventId: event.id }
          if (result === 'won') {
            const applied = applyPoint(match, side)
            next = applied.match
            record.scoreSide = side
            record.setIndex = applied.setIndex
            record.setNoBefore = applied.setNoBefore
            record.hadSetComplete = applied.hadSetComplete
            record.hadMatchFinish = applied.hadMatchFinish
            record.rotationAutoShift = applied.rotationAutoShift
            record.servingSideBefore = applied.servingSideBefore
          }
          next = { ...next, events: [...match.events, event] }
          eventUndoRegistry[matchId] = record
          return { matches: { ...st.matches, [matchId]: next }, _undoEventIds: { ...st._undoEventIds, [matchId]: event.id } }
        })
        if (eventUndoTimers[matchId]) clearTimeout(eventUndoTimers[matchId])
        eventUndoTimers[matchId] = setTimeout(() => {
          set((st) => ({ _undoEventIds: { ...st._undoEventIds, [matchId]: null } }))
        }, 3500)
      },
      substitutePlayer: (matchId, side, setNo, position, incomingPlayerId) => {
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const current = match.rotation[side][setNo] ?? emptyRotation()
          const outgoingPlayerId = current.find((s) => s.position === position)?.playerId ?? null
          const nextSlots = current.map((slot) => {
            if (slot.position === position) return { ...slot, playerId: incomingPlayerId }
            if (slot.playerId === incomingPlayerId) return { ...slot, playerId: null }
            return slot
          })
          const event: MatchEvent = {
            id: uid(),
            ts: Date.now(),
            set: match.set,
            type: 'substitution',
            side,
            subOutPlayerId: outgoingPlayerId ?? undefined,
            subInPlayerId: incomingPlayerId,
          }
          eventUndoRegistry[matchId] = { eventId: event.id, substitution: { side, setNo, position, previousPlayerId: outgoingPlayerId } }
          return {
            matches: {
              ...st.matches,
              [matchId]: {
                ...match,
                events: [...match.events, event],
                rotation: { ...match.rotation, [side]: { ...match.rotation[side], [setNo]: nextSlots } },
              },
            },
            _undoEventIds: { ...st._undoEventIds, [matchId]: event.id },
          }
        })
        if (eventUndoTimers[matchId]) clearTimeout(eventUndoTimers[matchId])
        eventUndoTimers[matchId] = setTimeout(() => {
          set((st) => ({ _undoEventIds: { ...st._undoEventIds, [matchId]: null } }))
        }, 3500)
      },
      undoLastEvent: (matchId) => {
        const undoId = get()._undoEventIds[matchId]
        if (!undoId) return
        if (eventUndoTimers[matchId]) clearTimeout(eventUndoTimers[matchId])
        const record = eventUndoRegistry[matchId]

        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          let next: Match = { ...match, events: match.events.filter((e) => e.id !== undoId) }

          if (record && record.eventId === undoId) {
            if (record.hadMatchFinish) next = { ...next, status: 'live' }
            if (record.hadSetComplete && record.setIndex != null && record.setNoBefore != null) {
              const setWinners = [...next.setWinners]
              setWinners[record.setIndex] = null
              next = { ...next, setWinners, set: record.setNoBefore }
            }
            if (record.scoreSide && record.setIndex != null) {
              const key = record.scoreSide === 'A' ? 'sA' : 'sB'
              const arr = [...next[key]]
              arr[record.setIndex] = Math.max(0, arr[record.setIndex] - 1)
              next = { ...next, [key]: arr }
              next = revertPointEffects(next, record.setNoBefore ?? next.set, record.rotationAutoShift, record.servingSideBefore)
            }
            if (record.substitution) {
              const { side, setNo, position, previousPlayerId } = record.substitution
              const current = next.rotation[side][setNo] ?? emptyRotation()
              const restored = current.map((slot) =>
                slot.position === position ? { ...slot, playerId: previousPlayerId } : slot,
              )
              next = { ...next, rotation: { ...next.rotation, [side]: { ...next.rotation[side], [setNo]: restored } } }
            }
          }

          return { matches: { ...st.matches, [matchId]: next }, _undoEventIds: { ...st._undoEventIds, [matchId]: null } }
        })
      },
      lastEvent: (matchId) => {
        const undoId = get()._undoEventIds[matchId]
        if (!undoId) return null
        const match = get().matches[matchId]
        return match?.events.find((e) => e.id === undoId) ?? null
      },

      assignRotation: (matchId, side, setNo, position, playerId) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const current = match.rotation[side][setNo] ?? emptyRotation()
          const nextSlots = current.map((slot) => {
            if (slot.position === position) return { ...slot, playerId }
            if (playerId && slot.playerId === playerId) return { ...slot, playerId: null }
            return slot
          })
          return {
            matches: {
              ...st.matches,
              [matchId]: {
                ...match,
                rotation: { ...match.rotation, [side]: { ...match.rotation[side], [setNo]: nextSlots } },
              },
            },
          }
        }),
      rotateLineup: (matchId, side, setNo) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const current = match.rotation[side][setNo] ?? emptyRotation()
          const rotated = rotateSlots(current)
          return {
            matches: {
              ...st.matches,
              [matchId]: {
                ...match,
                rotation: { ...match.rotation, [side]: { ...match.rotation[side], [setNo]: rotated } },
              },
            },
          }
        }),
      getRotation: (matchId, side, setNo) => get().matches[matchId]?.rotation[side]?.[setNo] ?? emptyRotation(),
      setServingSide: (matchId, setNo, side) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          return {
            matches: { ...st.matches, [matchId]: { ...match, servingSide: { ...(match.servingSide ?? {}), [setNo]: side } } },
          }
        }),
      getServingSide: (matchId, setNo) => get().matches[matchId]?.servingSide?.[setNo] ?? null,

      setLiveShareEnabled: (matchId, enabled) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          return { matches: { ...st.matches, [matchId]: { ...match, liveShareEnabled: enabled } } }
        }),

      setMatchVideoUrl: (matchId, url) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          return { matches: { ...st.matches, [matchId]: { ...match, videoUrl: url, videoStartedAt: null } } }
        }),
      calibrateMatchVideo: (matchId, referenceTs, videoSecondsAtReference) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          const videoStartedAt = referenceTs - videoSecondsAtReference * 1000
          return { matches: { ...st.matches, [matchId]: { ...match, videoStartedAt } } }
        }),
      clearMatchVideoCalibration: (matchId) =>
        set((st) => {
          const match = st.matches[matchId]
          if (!match) return st
          return { matches: { ...st.matches, [matchId]: { ...match, videoStartedAt: null } } }
        }),
    }),
    {
      name: 'mohallel-matches',
      storage: createJSONStorage(() => supabaseStorage),
      skipHydration: true,
      version: 1,
      partialize: (st): MatchesStoreState => ({ matches: st.matches, _undoIds: {}, _undoEventIds: {} }),
      migrate: (persisted) => migrateMatchesState(persisted),
    },
  ),
)

/**
 * يهاجر بيانات مباريات محفوظة بنسخة قديمة (قبل: side على الإجراء، events، تشكيلة
 * منفصلة لكل فريق) إلى الشكل الحالي، بلا فقدان أي بيانات — يُشغَّل مرة واحدة تلقائياً
 * عبر آلية persist عند تغيّر رقم الإصدار.
 */
function migrateMatchesState(persisted: unknown): MatchesStoreState {
  const state = (persisted ?? {}) as { matches?: Record<string, unknown> }
  const rawMatches = state.matches ?? {}

  const matches: Record<string, Match> = {}
  for (const [id, raw] of Object.entries(rawMatches)) {
    const m = raw as Record<string, unknown>
    const rawRotation = (m.rotation ?? {}) as Record<string, unknown>
    const isLegacyRotation = !('A' in rawRotation) && !('B' in rawRotation)
    const rotation = isLegacyRotation
      ? { A: rawRotation as Record<number, RotationSlot[]>, B: {} }
      : (rawRotation as Match['rotation'])

    const act: Action[] = ((m.act as Partial<Action>[] | undefined) ?? []).map((a) => ({
      ...(a as Action),
      side: a.side ?? 'A',
    }))

    matches[id] = {
      ...(m as object),
      opponentPresetId: (m.opponentPresetId as string | null | undefined) ?? null,
      act,
      events: (m.events as MatchEvent[] | undefined) ?? [],
      rotation,
    } as Match
  }

  return { matches, _undoIds: {}, _undoEventIds: {} }
}
