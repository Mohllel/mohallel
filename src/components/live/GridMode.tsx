import { useState } from 'react'
import { COURT_POSITIONS } from '../../constants/courtPositions'
import { SKILLS } from '../../constants/skills'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import { cellCount, playerTotalInSet, skillTotal } from '../../lib/stats'
import type { Player, Quality, RotationPosition, SkillKey } from '../../types/domain'
import { BenchStrip } from '../court/BenchStrip'
import { PlayerCircle } from '../court/PlayerCircle'
import { RotationEditor } from '../court/RotationEditor'
import { PlayerRecordSheet } from './PlayerRecordSheet'
import { SkillLegend } from './SkillLegend'

interface GridModeProps {
  matchId: string
  paused: boolean
}

/** وضع "دقيق" — نصف ملعب بالتشكيلة الأساسية بدل جدول، مع تسجيل تحليلي كامل لكل لاعب واحتساب النقطة تلقائياً */
export function GridMode({ matchId, paused }: GridModeProps) {
  const players = useMatchPlayers(matchId)
  const match = useMatchesStore((s) => s.matches[matchId])
  const { getRotation, assignRotation, rotateLineup, substitutePlayer, addAction } = useMatchesStore()

  const [showSummary, setShowSummary] = useState(false)
  const [rotationOpen, setRotationOpen] = useState(false)
  const [benchSelection, setBenchSelection] = useState<string | null>(null)
  const [recordFor, setRecordFor] = useState<Player | null>(null)

  if (!match) return null
  const { act, set } = match

  const rotation = getRotation(matchId, 'A', set)
  const onCourtIds = new Set(rotation.map((s) => s.playerId).filter(Boolean))
  const benchPlayers = players.filter((p) => !onCourtIds.has(p.id))

  const handleCircleClick = (position: RotationPosition, player: Player) => {
    if (benchSelection) {
      substitutePlayer(matchId, 'A', set, position, benchSelection)
      setBenchSelection(null)
      return
    }
    if (paused) return
    setRecordFor(player)
  }

  const handleBenchSelect = (playerId: string) => {
    setBenchSelection((prev) => (prev === playerId ? null : playerId))
  }

  const handleRecord = (skill: SkillKey, quality: Quality) => {
    if (!recordFor) return
    addAction(matchId, { side: 'A', playerId: recordFor.id, skill, quality })
    setRecordFor(null)
  }

  return (
    <div className="p-2 relative">
      {paused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/70 backdrop-blur-[1px] rounded-2xl">
          <span className="text-[12px] font-extrabold text-warn bg-s1 border border-warn/40 rounded-xl px-3 py-1.5">
            ⏸ التسجيل متوقف أثناء التايم آوت
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-2 px-0.5">
        <button
          onClick={() => setRotationOpen(true)}
          className="px-2.5 py-1.5 bg-s1 border border-bd rounded-lg text-[10px] font-bold text-pri"
        >
          🔄 التشكيلة
        </button>
        <button
          onClick={() => setShowSummary((v) => !v)}
          className="px-3 py-1.5 bg-s2 border border-bd rounded-lg text-[11px] font-bold text-pri"
        >
          {showSummary ? '🏐 الملعب' : '📊 الملخص'}
        </button>
      </div>

      {!showSummary ? (
        <>
          <div className="mb-1.5">
            <BenchStrip players={benchPlayers} selectedId={benchSelection} onSelect={handleBenchSelect} variant="own" />
          </div>

          <div className="relative w-full aspect-[3/2] bg-s2 border border-bd rounded-2xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-white/25" />
            {COURT_POSITIONS.map((cp) => {
              const slot = rotation.find((r) => r.position === cp.position)
              const player = slot?.playerId ? players.find((p) => p.id === slot.playerId) ?? null : null
              return (
                <PlayerCircle
                  key={cp.position}
                  x={cp.x}
                  y={cp.y}
                  player={player}
                  variant="own"
                  highlighted={!!benchSelection && !!player}
                  onClick={() => player && handleCircleClick(cp.position, player)}
                  onEmptyClick={() => setRotationOpen(true)}
                />
              )
            })}
          </div>

          <p className="text-center text-[10px] text-t3 mt-2">
            انقر لاعباً بالملعب لتسجيل مهارة له • اختر لاعب احتياط ثم لاعباً بالملعب لتبديلهما
          </p>
        </>
      ) : (
        <>
          <SkillLegend />
          <div className="overflow-x-auto">
            <table className="w-full border-separate [border-spacing:3px]">
              <thead>
                <tr>
                  <th className="min-w-[70px] text-right text-[9px] font-extrabold text-t3 sticky top-0 bg-bg">
                    اللاعب
                  </th>
                  {SKILLS.map((s) => (
                    <th key={s.k} className="min-w-[38px] text-[9px] font-extrabold text-t3 sticky top-0 bg-bg">
                      <span className="inline-block w-1.5 h-1.5 rounded-full mb-0.5" style={{ background: s.c }} />
                      <br />
                      {s.k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id}>
                    <td className="px-2 py-1.5 text-[12px] font-bold whitespace-nowrap sticky right-0 bg-s1 rounded-lg min-w-[70px]">
                      {p.name.split(' ')[0]}{' '}
                      <span className="text-t3 text-[10px]">{playerTotalInSet(act, p.id, set) || ''}</span>
                    </td>
                    {SKILLS.map((s) => {
                      const count = cellCount(act, p.id, s.k, set)
                      return (
                        <td key={s.k} className="p-0 text-center align-middle">
                          <div
                            style={count ? { borderColor: 'var(--color-bl)', color: s.c } : undefined}
                            className="w-full min-w-9 h-[42px] rounded-lg bg-s1 border-[1.5px] border-bd text-t2 text-[13px] font-extrabold flex items-center justify-center"
                          >
                            {count || ''}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="text-right text-[10px] text-t3 pr-1">المجموع</td>
                  {SKILLS.map((s) => (
                    <td key={s.k} className="text-center text-[11px] font-extrabold text-pri py-1">
                      {skillTotal(act, s.k, set) || ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {recordFor && (
        <PlayerRecordSheet player={recordFor} onRecord={handleRecord} onClose={() => setRecordFor(null)} />
      )}

      {rotationOpen && (
        <RotationEditor
          title="التشكيلة"
          rotation={rotation}
          players={players}
          onAssign={(position, playerId) => assignRotation(matchId, 'A', set, position as RotationPosition, playerId)}
          onRotate={() => rotateLineup(matchId, 'A', set)}
          onClose={() => setRotationOpen(false)}
        />
      )}
    </div>
  )
}
