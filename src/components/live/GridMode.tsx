import { SKILLS } from '../../constants/skills'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import { cellCount, playerTotalInSet, skillTotal } from '../../lib/stats'
import type { SkillKey } from '../../types/domain'
import { SkillLegend } from './SkillLegend'

interface GridModeProps {
  matchId: string
  paused: boolean
  onRequestQuality: (rect: DOMRect, playerId: string, skill: SkillKey) => void
}

export function GridMode({ matchId, paused, onRequestQuality }: GridModeProps) {
  const players = useMatchPlayers(matchId)
  const match = useMatchesStore((s) => s.matches[matchId])
  if (!match) return null
  const { act, set } = match

  return (
    <div className="p-2 relative">
      {paused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/70 backdrop-blur-[1px] rounded-2xl">
          <span className="text-[12px] font-extrabold text-warn bg-s1 border border-warn/40 rounded-xl px-3 py-1.5">
            ⏸ التسجيل متوقف أثناء التايم آوت
          </span>
        </div>
      )}
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
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mb-0.5"
                  style={{ background: s.c }}
                />
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
                    <button
                      onClick={(e) => onRequestQuality(e.currentTarget.getBoundingClientRect(), p.id, s.k)}
                      disabled={paused}
                      style={count ? { borderColor: 'var(--color-bl)', color: s.c } : undefined}
                      className="w-full min-w-9 h-[42px] rounded-lg bg-s1 border-[1.5px] border-bd text-t2 text-[13px] font-extrabold flex items-center justify-center disabled:opacity-40"
                    >
                      {count || ''}
                    </button>
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
    </div>
  )
}
