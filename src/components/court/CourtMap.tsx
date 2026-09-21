import { useEffect, useRef, useState } from 'react'
import { sideBySideLayout } from '../../constants/courtPositions'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import type { Player, RotationPosition, TeamSide } from '../../types/domain'
import { BenchStrip } from './BenchStrip'
import { CourtZoneOverlay } from './CourtZoneOverlay'
import { EventLogPanel } from './EventLogPanel'
import { EventUndoBar } from './EventUndoBar'
import { PlayerCircle } from './PlayerCircle'
import { RotationEditor } from './RotationEditor'
import { SubstitutionModal } from './SubstitutionModal'

interface CourtMapProps {
  matchId: string
}

type ChallengeStep = 'pick-side' | TeamSide | null

export function CourtMap({ matchId }: CourtMapProps) {
  const ownPlayers = useMatchPlayers(matchId)
  const match = useMatchesStore((s) => s.matches[matchId])
  const {
    getRotation,
    assignRotation,
    rotateLineup,
    bumpScore,
    logPointAtZone,
    logTimeout,
    logChallenge,
    substitutePlayer,
    setServingSide,
    getServingSide,
  } = useMatchesStore()
  const { clubName, isPro, opponentRosters, addOpponentPlayer } = useClubStore()

  const [rotationOpen, setRotationOpen] = useState<TeamSide | null>(null)
  const [addOpponentAt, setAddOpponentAt] = useState<RotationPosition | null>(null)
  const [pointPopup, setPointPopup] = useState(false)
  const [timeoutPopup, setTimeoutPopup] = useState(false)
  const [challengeStep, setChallengeStep] = useState<ChallengeStep>(null)
  const [serverPopup, setServerPopup] = useState(false)
  const [subModalSide, setSubModalSide] = useState<TeamSide | null>(null)
  const [benchSelection, setBenchSelection] = useState<{ side: TeamSide; playerId: string } | null>(null)
  const [flash, setFlash] = useState<{ side: TeamSide; key: number } | null>(null)
  const flashKeyRef = useRef(0)
  const prevScoreRef = useRef<{ a: number; b: number } | null>(null)

  const ownName = clubName || 'فريقك'
  const opponentName = match?.opponentName || 'المنافس'

  useEffect(() => {
    if (!match) return
    const idx = match.set - 1
    const a = match.sA[idx]
    const b = match.sB[idx]
    if (prevScoreRef.current) {
      if (a > prevScoreRef.current.a) {
        flashKeyRef.current += 1
        setFlash({ side: 'A', key: flashKeyRef.current })
      } else if (b > prevScoreRef.current.b) {
        flashKeyRef.current += 1
        setFlash({ side: 'B', key: flashKeyRef.current })
      }
    }
    prevScoreRef.current = { a, b }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.sA, match?.sB, match?.set])

  if (!match) return null
  const set = match.set

  const opponentRoster = match.opponentPresetId ? opponentRosters[match.opponentPresetId] ?? [] : []
  /** يكفي تفعيل Pro لعرض ملعب المنافس — لاعبوه يُضافون يدوياً من الملعب نفسه، بلا حاجة لروستر جاهز مسبقاً */
  const opponentTrackingEnabled = isPro

  const playersBySide = (side: TeamSide): Player[] => (side === 'A' ? ownPlayers : opponentRoster)
  const rotation = (side: TeamSide) => getRotation(matchId, side, set)
  const benchPlayers = (side: TeamSide): Player[] => {
    const onCourtIds = new Set(rotation(side).map((s) => s.playerId).filter(Boolean))
    return playersBySide(side).filter((p) => !onCourtIds.has(p.id))
  }
  const findPlayer = (side: TeamSide, playerId: string | undefined) =>
    playerId ? playersBySide(side).find((p) => p.id === playerId) : undefined

  const handleZoneTap = (landedInSide: TeamSide, zone: number) => {
    logPointAtZone(matchId, landedInSide, zone)
  }

  const handleCircleClick = (side: TeamSide, position: RotationPosition) => {
    if (benchSelection && benchSelection.side === side) {
      substitutePlayer(matchId, side, set, position, benchSelection.playerId)
      setBenchSelection(null)
    }
  }

  const handleBenchSelect = (side: TeamSide, playerId: string) => {
    setBenchSelection((prev) => (prev && prev.side === side && prev.playerId === playerId ? null : { side, playerId }))
  }

  const handleAddOpponentPlayer = (name: string, number?: number) => {
    if (addOpponentAt === null || !match.opponentPresetId) return
    const newId = addOpponentPlayer(match.opponentPresetId, name, number)
    assignRotation(matchId, 'B', set, addOpponentAt, newId)
    setAddOpponentAt(null)
  }

  const renderHalf = (side: TeamSide) => {
    const showRoster = side === 'A' || opponentTrackingEnabled
    const slots = rotation(side)
    const layout = sideBySideLayout(side)

    return (
      <div className="relative flex-1 h-full">
        <CourtZoneOverlay onZoneTap={(zone) => handleZoneTap(side, zone)} />

        {flash?.side === side && (
          <div
            key={flash.key}
            onAnimationEnd={() => setFlash(null)}
            className={`absolute inset-0 pointer-events-none z-20 ${side === 'A' ? 'bg-pri' : 'bg-err'} animate-[scoreFlash_.6s_ease-out]`}
          />
        )}

        {showRoster ? (
          layout.map((cp) => {
            const slot = slots.find((r) => r.position === cp.position)
            const player = slot?.playerId ? playersBySide(side).find((p) => p.id === slot.playerId) ?? null : null
            return (
              <PlayerCircle
                key={cp.position}
                x={cp.x}
                y={cp.y}
                player={player}
                variant={side === 'A' ? 'own' : 'opponent'}
                highlighted={!!(benchSelection && benchSelection.side === side && player != null)}
                onClick={() => handleCircleClick(side, cp.position)}
                onEmptyClick={() => (side === 'A' ? setRotationOpen(side) : setAddOpponentAt(cp.position))}
              />
            )
          })
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-2 pointer-events-none z-10">
            <span className="text-[11px] text-t3 text-center leading-relaxed">🔒 عرض لاعبي المنافس ميزة Pro</span>
          </div>
        )}
      </div>
    )
  }

  const servingSide = getServingSide(matchId, set)

  return (
    <div className="p-3 max-w-[640px] mx-auto">
      <div className="flex gap-2 items-start">
        <EventLogPanel events={match.events} ownName={ownName} opponentName={opponentName} findPlayer={findPlayer} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <span className="text-[12px] font-extrabold text-t2 flex-1 truncate">
              {ownName} {servingSide === 'A' && <span className="text-[10px]">🏐</span>}
            </span>
            <button
              onClick={() => setPointPopup(true)}
              className="px-4 py-1.5 bg-err text-white rounded-lg text-[12px] font-extrabold shadow-[0_2px_10px_rgba(239,68,68,0.35)]"
            >
              ⚡ نقطة
            </button>
            <span className="text-[12px] font-extrabold text-t2 flex-1 truncate text-left">
              {servingSide === 'B' && <span className="text-[10px]">🏐</span>} {opponentName}
            </span>
          </div>

          <div className="flex justify-center mb-2">
            <button onClick={() => setServerPopup(true)} className="text-[10px] font-bold text-t3 underline">
              {servingSide ? `🏐 يُرسل: ${servingSide === 'A' ? ownName : opponentName} (تصحيح)` : '🏐 حدّد من يبدأ بالإرسال'}
            </button>
          </div>

          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <button
              onClick={() => setRotationOpen('A')}
              className="px-2.5 py-1.5 bg-s1 border border-bd rounded-lg text-[10px] font-bold text-pri"
            >
              🔄 التشكيلة
            </button>
            <div className="flex gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => setSubModalSide('A')}
                className="px-2.5 py-1.5 bg-s1 border border-bd rounded-lg text-[10px] font-bold text-ok"
              >
                🔁 تبديل
              </button>
              <button
                onClick={() => setTimeoutPopup(true)}
                className="px-2.5 py-1.5 bg-s1 border border-bd rounded-lg text-[10px] font-bold text-warn"
              >
                ⏱ تايم آوت
              </button>
              <button
                onClick={() => setChallengeStep('pick-side')}
                className="px-2.5 py-1.5 bg-s1 border border-bd rounded-lg text-[10px] font-bold text-sec"
              >
                🖥 تحدي VAR
              </button>
            </div>
            {opponentTrackingEnabled && (
              <button
                onClick={() => setRotationOpen('B')}
                className="px-2.5 py-1.5 bg-s1 border border-bd rounded-lg text-[10px] font-bold text-sec"
              >
                🔄 التشكيلة
              </button>
            )}
          </div>

          <div className="flex items-start gap-0.5 mb-1.5">
            <div className="flex-1">
              <BenchStrip
                players={benchPlayers('A')}
                selectedId={benchSelection?.side === 'A' ? benchSelection.playerId : null}
                onSelect={(id) => handleBenchSelect('A', id)}
                variant="own"
              />
            </div>
            <div className="w-[2px] self-stretch" />
            <div className="flex-1">
              {opponentTrackingEnabled && (
                <BenchStrip
                  players={benchPlayers('B')}
                  selectedId={benchSelection?.side === 'B' ? benchSelection.playerId : null}
                  onSelect={(id) => handleBenchSelect('B', id)}
                  variant="opponent"
                />
              )}
            </div>
          </div>

          <div className="relative w-full aspect-[4/5] bg-s2 border border-bd rounded-2xl overflow-hidden flex">
            {renderHalf('A')}
            <div className="w-[2px] bg-white/15 shrink-0 z-10" />
            {renderHalf('B')}
          </div>

          <p className="text-center text-[10px] text-t3 mt-2">
            نقرة على مكان سقوط الكرة = نقطة تلقائية للفريق الآخر • عند اكتساب الإرسال تُدوَّر التشكيلة تلقائياً
          </p>
        </div>
      </div>

      {rotationOpen && (
        <RotationEditor
          title={rotationOpen === 'A' ? ownName : opponentName}
          rotation={rotation(rotationOpen)}
          players={playersBySide(rotationOpen)}
          onAssign={(position, playerId) => assignRotation(matchId, rotationOpen, set, position as RotationPosition, playerId)}
          onRotate={() => rotateLineup(matchId, rotationOpen, set)}
          onClose={() => setRotationOpen(null)}
        />
      )}

      {addOpponentAt !== null && (
        <AddOpponentPlayerPopup
          position={addOpponentAt}
          onAdd={handleAddOpponentPlayer}
          onClose={() => setAddOpponentAt(null)}
        />
      )}

      {pointPopup && (
        <SidePickerPopup
          title="نقطة سريعة (بلا مكان محدد)"
          ownName={ownName}
          opponentName={opponentName}
          onPick={(side) => {
            bumpScore(matchId, side, 1)
            setPointPopup(false)
          }}
          onClose={() => setPointPopup(false)}
        />
      )}

      {timeoutPopup && (
        <SidePickerPopup
          title="تايم آوت — لأي فريق؟"
          ownName={ownName}
          opponentName={opponentName}
          onPick={(side) => {
            logTimeout(matchId, side)
            setTimeoutPopup(false)
          }}
          onClose={() => setTimeoutPopup(false)}
        />
      )}

      {challengeStep === 'pick-side' && (
        <SidePickerPopup
          title="تحدي (VAR) — لأي فريق؟"
          ownName={ownName}
          opponentName={opponentName}
          onPick={(side) => setChallengeStep(side)}
          onClose={() => setChallengeStep(null)}
        />
      )}

      {(challengeStep === 'A' || challengeStep === 'B') && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60" onClick={() => setChallengeStep(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-s1 border border-bd rounded-2xl p-4 w-72">
            <div className="text-[13px] font-extrabold text-center mb-3">
              نتيجة تحدي {challengeStep === 'A' ? ownName : opponentName}؟
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  logChallenge(matchId, challengeStep, 'won')
                  setChallengeStep(null)
                }}
                className="flex-1 py-3 bg-ok text-white rounded-xl font-extrabold text-[13px]"
              >
                نجح ✅
              </button>
              <button
                onClick={() => {
                  logChallenge(matchId, challengeStep, 'lost')
                  setChallengeStep(null)
                }}
                className="flex-1 py-3 bg-err text-white rounded-xl font-extrabold text-[13px]"
              >
                فشل ❌
              </button>
            </div>
          </div>
        </div>
      )}

      {serverPopup && (
        <SidePickerPopup
          title="من يبدأ بالإرسال بهذا الشوط؟"
          ownName={ownName}
          opponentName={opponentName}
          onPick={(side) => {
            setServingSide(matchId, set, side)
            setServerPopup(false)
          }}
          onClose={() => setServerPopup(false)}
        />
      )}

      {subModalSide && (
        <SubstitutionModal
          side={subModalSide}
          ownName={ownName}
          opponentName={opponentName}
          rotation={rotation(subModalSide)}
          players={playersBySide(subModalSide)}
          benchPlayers={benchPlayers(subModalSide)}
          onSubstitute={(position, incomingPlayerId) =>
            substitutePlayer(matchId, subModalSide, set, position as RotationPosition, incomingPlayerId)
          }
          onSwitchSide={opponentTrackingEnabled ? () => setSubModalSide(subModalSide === 'A' ? 'B' : 'A') : undefined}
          onClose={() => setSubModalSide(null)}
        />
      )}

      <EventUndoBar matchId={matchId} ownName={ownName} opponentName={opponentName} />
    </div>
  )
}

interface AddOpponentPlayerPopupProps {
  position: RotationPosition
  onAdd: (name: string, number?: number) => void
  onClose: () => void
}

function AddOpponentPlayerPopup({ position, onAdd, onClose }: AddOpponentPlayerPopupProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, number === '' ? undefined : Number(number))
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-s1 border border-bd rounded-2xl p-4 w-72">
        <div className="text-[13px] font-extrabold text-center mb-3">إضافة لاعب منافس — الموقع {position}</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="اسم اللاعب"
          autoFocus
          className="mb-2"
        />
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          type="number"
          placeholder="الرقم (اختياري)"
          className="mb-3"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full py-3 bg-pri text-white rounded-xl font-extrabold text-[13px] disabled:opacity-40"
        >
          إضافة
        </button>
      </div>
    </div>
  )
}

interface SidePickerPopupProps {
  title: string
  ownName: string
  opponentName: string
  onPick: (side: TeamSide) => void
  onClose: () => void
}

function SidePickerPopup({ title, ownName, opponentName, onPick, onClose }: SidePickerPopupProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-s1 border border-bd rounded-2xl p-4 w-72">
        <div className="text-[13px] font-extrabold text-center mb-3">{title}</div>
        <div className="flex gap-2">
          <button onClick={() => onPick('A')} className="flex-1 py-3 bg-pri text-white rounded-xl font-extrabold text-[13px]">
            {ownName}
          </button>
          <button onClick={() => onPick('B')} className="flex-1 py-3 bg-err text-white rounded-xl font-extrabold text-[13px]">
            {opponentName}
          </button>
        </div>
      </div>
    </div>
  )
}
