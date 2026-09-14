import { QUALITIES } from '../../constants/quality'
import { SKILLS } from '../../constants/skills'
import { playerStats } from '../../lib/stats'
import type { Action, Player } from '../../types/domain'

interface PlayerDetailTabProps {
  player: Player
  actions: Action[]
  onBack: () => void
}

export function PlayerDetailTab({ player, actions, onBack }: PlayerDetailTabProps) {
  const stats = playerStats(actions, player.id)

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="w-[34px] h-[34px] rounded-[10px] bg-s2 border border-bd text-t2 flex items-center justify-center">
          →
        </button>
        <h3 className="text-[16px] font-black flex-1">{player.name}</h3>
        <span className="text-[11px] text-t3">{stats.tot} إجراء</span>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl overflow-hidden mb-3">
        <div className="flex px-2.5 py-2 bg-s2 border-b border-bd">
          <span className="flex-[2] text-[11px] text-right font-semibold">المهارة</span>
          <span className="flex-1 text-[11px] text-center font-semibold">المجموع</span>
          <span className="flex-1 text-[11px] text-center font-semibold">المتوسط</span>
          {QUALITIES.map((q) => (
            <span key={q.v} style={{ color: q.c }} className="flex-1 text-[11px] text-center font-semibold">
              {q.s}
            </span>
          ))}
        </div>
        {SKILLS.map((s) => (
          <div key={s.k} className="flex px-2.5 py-1.5 border-b border-bd last:border-b-0">
            <span className="flex-[2] text-[11px] text-right font-extrabold" style={{ color: s.c }}>
              {s.l}
            </span>
            <span className="flex-1 text-[11px] text-center">{stats[s.k].t}</span>
            <span className="flex-1 text-[11px] text-center">{stats[s.k].avg}</span>
            {stats[s.k].cn.map((n, i) => (
              <span key={i} className="flex-1 text-[11px] text-center">
                {n || '—'}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
