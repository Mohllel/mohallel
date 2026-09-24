import { useEffect, useRef, useState } from 'react'
import { sideBySideLayout } from '../../constants/courtPositions'
import { otherSide } from '../../lib/scoring'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import type { Player, RotationPosition, SkillKey, TeamSide } from '../../types/domain'
import { BenchStrip } from './BenchStrip'
import { CourtZoneOverlay } from './CourtZoneOverlay'
import { PlayerCircle } from './PlayerCircle'
import { PointTagPrompt } from './PointTagPrompt'
import { RotationEditor } from './RotationEditor'

interface CourtMapProps {
  matchId: string
  /** أثناء تايم آوت — يعطّل تسجيل النقاط بالنقر على مكان سقوط الكرة */
  paused: boolean
}

export function CourtMap({ matchId, paused }: CourtMapProps) {
  const ownPlayers = useMatchPlayers(matchId)
  const match = useMatchesStore((s) => s.matches[matchId])
  const { getRotation, assignRotation, rotateLineup, logPointAtZone, substitutePlayer, tagPointAction } =
    useMatchesStore()
  const { clubName, isPro, opponentRosters, addOpponentPlayer } = useClubStore()

  const [rotationOpen, setRotationOpen] = useState(false)
  const [addOpponentAt, setAddOpponentAt] = useState<RotationPosition | null>(null)
  const [benchSelection, setBenchSelection] = useState<{ side: TeamSide; playerId: string } | null>(null)
  const [flash, setFlash] = useState<{ side: TeamSide; key: number } | null>(null)
  const [tagPrompt, setTagPrompt] = useState<{ side: TeamSide; zone: number } | null>(null)
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

  const handleZoneTap = (landedInSide: TeamSide, zone: number) => {
    if (paused) return
    logPointAtZone(matchId, landedInSide, zone)
    setTagPrompt({ side: otherSide(landedInSide), zone })
  }

  const handleTagPoint = (playerId: string, skill: SkillKey) => {
    if (!tagPrompt) return
    tagPointAction(matchId, { side: tagPrompt.side, playerId, skill, quality: 3, zone: tagPrompt.zone })
    setTagPrompt(null)
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
                onEmptyClick={() => (side === 'A' ? setRotationOpen(true) : setAddOpponentAt(cp.position))}
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

  return (
    <div className="p-3 max-w-[640px] mx-auto">
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

        {paused && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/70 backdrop-blur-[1px]">
            <span className="text-[12px] font-extrabold text-warn bg-s1 border border-warn/40 rounded-xl px-3 py-1.5">
              ⏸ توقفت النقر لتسجيل النقاط أثناء التايم آوت
            </span>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-t3 mt-2">
        نقرة على مكان سقوط الكرة = نقطة تلقائية للفريق الآخر • عند اكتساب الإرسال تُدوَّر التشكيلة تلقائياً
      </p>

      {rotationOpen && (
        <RotationEditor
          title={ownName}
          rotation={rotation('A')}
          players={playersBySide('A')}
          onAssign={(position, playerId) => assignRotation(matchId, 'A', set, position as RotationPosition, playerId)}
          onRotate={() => rotateLineup(matchId, 'A', set)}
          onClose={() => setRotationOpen(false)}
        />
      )}

      {addOpponentAt !== null && (
        <AddOpponentPlayerPopup
          position={addOpponentAt}
          onAdd={handleAddOpponentPlayer}
          onClose={() => setAddOpponentAt(null)}
        />
      )}

      {tagPrompt &&
        (() => {
          const onCourtIds = new Set(rotation(tagPrompt.side).map((s) => s.playerId).filter(Boolean))
          const onCourtPlayers = playersBySide(tagPrompt.side).filter((p) => onCourtIds.has(p.id))
          return (
            <PointTagPrompt
              scoringName={tagPrompt.side === 'A' ? ownName : opponentName}
              players={onCourtPlayers}
              onTag={handleTagPoint}
              onDismiss={() => setTagPrompt(null)}
            />
          )
        })()}
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
