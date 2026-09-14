import { forwardRef } from 'react'
import { Logo } from '../brand/Logo'
import { bestPlayer, playerErrorCount, playerPoints, worstPlayer } from '../../lib/analytics'
import { countSetWins } from '../../lib/scoring'
import type { Action, Match, Player } from '../../types/domain'
import { SkillQualityHeatmap } from './SkillQualityHeatmap'

interface InfographicProps {
  match: Match
  players: Player[]
  clubName: string
  clubLogo: string | null
  actions: Action[]
}

export const Infographic = forwardRef<HTMLDivElement, InfographicProps>(
  ({ match, players, clubName, clubLogo, actions }, ref) => {
    const setsA = countSetWins(match.setWinners, 'A')
    const setsB = countSetWins(match.setWinners, 'B')
    const best = bestPlayer(players, actions)
    const worst = worstPlayer(players, actions)

    const rows = players
      .map((p) => ({
        player: p,
        points: playerPoints(actions, p.id),
        errors: playerErrorCount(actions, p.id),
        total: actions.filter((a) => a.playerId === p.id).length,
      }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.points - a.points)

    return (
      <div ref={ref} style={{ width: 800 }} className="relative bg-bg text-t1 flex flex-col p-7 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pri/15 via-transparent to-sec/15 pointer-events-none" />

        <div className="relative flex items-center gap-2.5 mb-6">
          <Logo size={40} />
          <span className="text-[20px] font-black text-pri">مُحلّل</span>
        </div>

        <div className="relative flex items-center justify-between mb-2 bg-s1/70 border border-bd rounded-2xl p-5">
          <TeamBlock name={clubName || 'فريقك'} logo={clubLogo} />
          <span className="text-[40px] font-black">
            {setsA}
            <span className="text-t3 mx-2">:</span>
            {setsB}
          </span>
          <TeamBlock name={match.opponentName || 'المنافس'} logo={match.opponentLogo} />
        </div>
        <p className="relative text-center text-[12px] text-t3 mb-6">{match.date}</p>

        <div className="relative grid grid-cols-2 gap-4 mb-6">
          <HighlightCard label="⭐ أفضل لاعب" ranking={best} actions={actions} color="var(--color-ok)" />
          <HighlightCard label="⚠ يحتاج تحسين" ranking={worst} actions={actions} color="var(--color-err)" />
        </div>

        <div className="relative bg-s1/70 border border-bd rounded-2xl p-4">
          <div className="text-[14px] font-extrabold text-sec mb-3">📋 كل اللاعبين</div>
          <div className="flex px-2 pb-2 mb-1 border-b border-bd text-[10px] font-bold text-t3">
            <span className="flex-1">اللاعب</span>
            <span className="w-16 text-center">نقاط</span>
            <span className="w-16 text-center">أخطاء</span>
            <span className="w-16 text-center">إجمالي</span>
          </div>
          {rows.map((r) => (
            <div key={r.player.id} className="flex items-center px-2 py-1.5 border-b border-bg last:border-b-0">
              <span className="flex-1 text-[12px] font-bold truncate">{r.player.name}</span>
              <span className="w-16 text-center text-[12px] font-extrabold text-ok">{r.points}</span>
              <span className="w-16 text-center text-[12px] font-extrabold text-err">{r.errors}</span>
              <span className="w-16 text-center text-[12px] text-t2">{r.total}</span>
            </div>
          ))}
        </div>

        <div className="relative text-center text-[10px] text-t3 pt-5">مُحلّل — تحليل مباريات كرة الطائرة</div>
      </div>
    )
  },
)
Infographic.displayName = 'Infographic'

function TeamBlock({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-28">
      <div className="w-14 h-14 rounded-xl bg-s2 border border-bl overflow-hidden flex items-center justify-center text-pri font-black">
        {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : name.substring(0, 2)}
      </div>
      <span className="text-[12px] font-bold text-center truncate w-full">{name}</span>
    </div>
  )
}

function HighlightCard({
  label,
  ranking,
  actions,
  color,
}: {
  label: string
  ranking: { player: Player; average: number } | null
  actions: Action[]
  color: string
}) {
  return (
    <div className="bg-s1/70 border border-bd rounded-2xl p-3">
      <div className="text-[12px] font-extrabold mb-1.5" style={{ color }}>
        {label}
      </div>
      {!ranking ? (
        <p className="text-[11px] text-t3">لا توجد بيانات كافية</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[14px] font-black truncate">{ranking.player.name}</span>
            <span className="text-[12px] font-extrabold" style={{ color }}>
              {ranking.average.toFixed(1)}
            </span>
          </div>
          <SkillQualityHeatmap actions={actions} playerId={ranking.player.id} size="compact" />
        </>
      )}
    </div>
  )
}
