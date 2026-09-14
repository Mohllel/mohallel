import { SKILLS } from '../../constants/skills'
import { playerStats } from '../../lib/stats'
import type { Action, Player } from '../../types/domain'
import { StatBar } from './StatBar'

interface OverviewTabProps {
  players: Player[]
  actions: Action[]
  onSelectPlayer: (id: string) => void
}

export function OverviewTab({ players, actions, onSelectPlayer }: OverviewTabProps) {
  return (
    <>
      {players.map((p) => {
        const stats = playerStats(actions, p.id)
        const max = Math.max(...SKILLS.map((s) => stats[s.k].t), 1)
        return (
          <div
            key={p.id}
            onClick={() => onSelectPlayer(p.id)}
            className="bg-s1 border border-bd rounded-2xl p-3 mb-2 cursor-pointer"
          >
            <div className="flex justify-between mb-2">
              <span className="text-[14px] font-extrabold">{p.name}</span>
              <span className="text-[11px] text-t3">{stats.tot} إجراء</span>
            </div>
            {SKILLS.map((s) => (
              <StatBar key={s.k} label={s.l} value={stats[s.k].t} max={max} color={s.c} />
            ))}
          </div>
        )
      })}
    </>
  )
}
