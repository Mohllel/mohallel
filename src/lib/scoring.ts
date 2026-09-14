import type { Match, Quality, RotationSlot, ServeType, SkillKey, TeamSide } from '../types/domain'

/** المهارات التي تُنهي الكرة لصالح مُنفّذها عند تقييم ممتاز */
const POINT_SKILLS: SkillKey[] = ['S', 'SS', 'B']

export const otherSide = (side: TeamSide): TeamSide => (side === 'A' ? 'B' : 'A')

/**
 * يحدد إن كان إجراء مسجَّل يستحق نقطة تلقائية، ولمن، بالنسبة للفريق الذي نفّذ الإجراء.
 * خطأ (F) أو إرسال ضائع = نقطة للفريق الآخر دائماً. تقييم ممتاز على هجوم/إرسال/بلوك
 * (ومنها الإرسال المباشر الذي يُضبط تلقائياً على ممتاز) = نقطة لمنفّذ الإجراء.
 * غير ذلك: كرة متداولة، تسجيل فقط بلا نقطة.
 */
export function pointSideForAction(
  actingSide: TeamSide,
  skill: SkillKey,
  quality: Quality,
  serveType?: ServeType,
): TeamSide | null {
  if (skill === 'F' || serveType === 'error') return otherSide(actingSide)
  if (quality === 3 && POINT_SKILLS.includes(skill)) return actingSide
  return null
}

export interface SetCompletion {
  winner: 'A' | 'B'
}

/** حد النقاط: 25 لعموم الأشواط، 15 للشوط الخامس (الفاصل) — بفارق نقطتين على الأقل */
export function checkSetComplete(scoreA: number, scoreB: number, setNo: number): SetCompletion | null {
  const threshold = setNo === 5 ? 15 : 25
  const diff = Math.abs(scoreA - scoreB)
  if (diff < 2) return null
  if (scoreA >= threshold && scoreA > scoreB) return { winner: 'A' }
  if (scoreB >= threshold && scoreB > scoreA) return { winner: 'B' }
  return null
}

/** المباراة تُحسم لأول فريق يفوز بـ3 أشواط (من 5) */
export function countSetWins(setWinners: (('A' | 'B') | null)[], side: 'A' | 'B'): number {
  return setWinners.filter((w) => w === side).length
}

export function isMatchDecided(setWinners: (('A' | 'B') | null)[]): 'A' | 'B' | null {
  const winsA = countSetWins(setWinners, 'A')
  const winsB = countSetWins(setWinners, 'B')
  if (winsA >= 3) return 'A'
  if (winsB >= 3) return 'B'
  return null
}

export const emptyRotation = (): RotationSlot[] =>
  [1, 2, 3, 4, 5, 6].map((position) => ({ position: position as RotationSlot['position'], playerId: null }))

/** يدوّر التشكيلة موقعاً واحداً باتجاه الدوران الحقيقي (2→1، 3→2، ...، 1→6) */
export function rotateSlots(slots: RotationSlot[]): RotationSlot[] {
  const order: RotationSlot['position'][] = [1, 2, 3, 4, 5, 6]
  const byPos = new Map(slots.map((s) => [s.position, s.playerId]))
  return order.map((pos, i) => {
    const fromPos = order[(i + 1) % order.length]
    return { position: pos, playerId: byPos.get(fromPos) ?? null }
  })
}

export interface ScoreApplyResult {
  match: Match
  setIndex: number
  setNoBefore: number
  hadSetComplete: boolean
  hadMatchFinish: boolean
  /** يُملأ إن تسبّبت هذه النقطة بدوران تلقائي للتشكيلة (اكتساب الإرسال) — يلزم للتراجع */
  rotationAutoShift?: { side: TeamSide; setNo: number; previousSlots: RotationSlot[] }
  /** الفريق المُرسِل قبل هذه النقطة (لإعادته عند التراجع) */
  servingSideBefore?: TeamSide | null
}

/**
 * يطبّق نقطة على مباراة: يزيد نتيجة الشوط الحالي، يتتبّع من يُرسل ويُدوّر تشكيلة
 * الفريق تلقائياً عند اكتسابه الإرسال (تبديل تلقائي حقيقي)، ويتحقق من اكتمال الشوط
 * (ويُنهي المباراة أو يفتح شوطاً جديداً تلقائياً عند الاقتضاء). دالة نقية.
 */
export function applyPoint(match: Match, side: 'A' | 'B'): ScoreApplyResult {
  const setIndex = match.set - 1
  const key = side === 'A' ? 'sA' : 'sB'
  const arr = [...match[key]]
  arr[setIndex] = arr[setIndex] + 1
  let next: Match = { ...match, [key]: arr }

  let hadSetComplete = false
  let hadMatchFinish = false
  let rotationAutoShift: ScoreApplyResult['rotationAutoShift']
  const servingSideBefore = match.servingSide?.[match.set] ?? null

  if (servingSideBefore !== side) {
    if (servingSideBefore !== null) {
      const previousSlots = next.rotation[side]?.[match.set] ?? emptyRotation()
      const rotated = rotateSlots(previousSlots)
      next = {
        ...next,
        rotation: { ...next.rotation, [side]: { ...next.rotation[side], [match.set]: rotated } },
      }
      rotationAutoShift = { side, setNo: match.set, previousSlots }
    }
    next = { ...next, servingSide: { ...(next.servingSide ?? {}), [match.set]: side } }
  }

  if (!match.setWinners[setIndex]) {
    const completion = checkSetComplete(next.sA[setIndex], next.sB[setIndex], match.set)
    if (completion) {
      const setWinners = [...next.setWinners]
      setWinners[setIndex] = completion.winner
      next = { ...next, setWinners }
      hadSetComplete = true

      const decided = isMatchDecided(setWinners)
      if (decided) {
        next = { ...next, status: 'finished' }
        hadMatchFinish = true
      } else if (match.set < 5) {
        const nextSetNo = match.set + 1
        next = {
          ...next,
          set: nextSetNo,
          rotation: {
            A: { ...next.rotation.A, [nextSetNo]: next.rotation.A[nextSetNo] ?? emptyRotation() },
            B: { ...next.rotation.B, [nextSetNo]: next.rotation.B[nextSetNo] ?? emptyRotation() },
          },
        }
      }
    }
  }

  return {
    match: next,
    setIndex,
    setNoBefore: match.set,
    hadSetComplete,
    hadMatchFinish,
    rotationAutoShift,
    servingSideBefore,
  }
}
