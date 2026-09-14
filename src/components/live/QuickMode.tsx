import { useRef } from 'react'
import { SKILLS } from '../../constants/skills'
import { DEFAULT_QUICK_QUALITY } from '../../constants/quality'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import { cellCount, playerTotalInSet, skillTotal } from '../../lib/stats'
import type { SkillKey } from '../../types/domain'

interface QuickModeProps {
  matchId: string
  onRequestQuality: (rect: DOMRect, playerId: string, skill: SkillKey) => void
}

export function QuickMode({ matchId, onRequestQuality }: QuickModeProps) {
  const players = useMatchPlayers(matchId)
  const match = useMatchesStore((s) => s.matches[matchId])
  const addAction = useMatchesStore((s) => s.addAction)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({})
  if (!match) return null
  const { act, set } = match

  const handleDown = (key: string, rect: DOMRect, playerId: string, skill: SkillKey) => {
    timers.current[key] = setTimeout(() => {
      onRequestQuality(rect, playerId, skill)
      timers.current[key] = null
    }, 400)
  }
  const handleUp = (key: string, playerId: string, skill: SkillKey) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key]!)
      timers.current[key] = null
      addAction(matchId, { side: 'A', playerId, skill, quality: DEFAULT_QUICK_QUALITY })
    }
  }
  const handleLeave = (key: string) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key]!)
      timers.current[key] = null
    }
  }

  return (
    <>
      <div className="text-center text-[11px] text-t3 bg-s1 mx-2 mb-1 rounded-[10px] border border-bd py-1.5">
        النقر يسجّل <strong className="text-ok">جيد (+)</strong> مباشرة — اضغط مطوّلاً لتغيير التقييم
      </div>
      <div className="p-2 overflow-x-auto">
        <table className="w-full border-separate [border-spacing:3px]">
          <thead>
            <tr>
              <th className="min-w-[70px] text-right text-[9px] font-extrabold text-t3">اللاعب</th>
              {SKILLS.map((s) => (
                <th key={s.k} className="min-w-[38px] text-[9px] font-extrabold text-t3">
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
                  const key = `${p.id}_${s.k}`
                  const count = cellCount(act, p.id, s.k, set)
                  return (
                    <td key={s.k} className="p-0 text-center align-middle">
                      <button
                        onPointerDown={(e) =>
                          handleDown(key, e.currentTarget.getBoundingClientRect(), p.id, s.k)
                        }
                        onPointerUp={() => handleUp(key, p.id, s.k)}
                        onPointerLeave={() => handleLeave(key)}
                        style={count ? { borderColor: 'var(--color-bl)', color: s.c } : undefined}
                        className="w-full min-w-9 h-[42px] rounded-lg bg-s1 border-[1.5px] border-bd text-t2 text-[13px] font-extrabold flex items-center justify-center"
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
    </>
  )
}
