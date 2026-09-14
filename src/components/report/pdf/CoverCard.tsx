import { forwardRef } from 'react'
import { Logo } from '../../brand/Logo'
import { SKILLS } from '../../../constants/skills'
import { countSetWins } from '../../../lib/scoring'
import { computeMatchSideout } from '../../../lib/sideout'
import type { Action, Match, Player } from '../../../types/domain'
import { StatBar } from '../StatBar'

interface CoverCardProps {
  match: Match
  players: Player[]
  actions: Action[]
  clubName: string
  clubLogo: string | null
}

/** بطاقة الغلاف — تُلتقط بجودة عالية ثم تُركَّب على الصفحة الأولى من PDF حقيقي */
export const CoverCard = forwardRef<HTMLDivElement, CoverCardProps>(
  ({ match, players, actions, clubName, clubLogo }, ref) => {
    const setsA = countSetWins(match.setWinners, 'A')
    const setsB = countSetWins(match.setWinners, 'B')
    const setScores = [0, 1, 2, 3, 4].filter((i) => match.setWinners[i] || match.sA[i] || match.sB[i])
    const max = Math.max(1, ...SKILLS.map((s) => actions.filter((a) => a.skill === s.k).length))
    const sideout = computeMatchSideout(match)

    return (
      <div ref={ref} style={{ width: 700 }} className="bg-bg text-t1 p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <Logo size={36} />
          <span className="text-[18px] font-black text-pri">مُحلّل</span>
          <span className="flex-1" />
          <span className="text-[11px] text-t3">{match.date}</span>
        </div>

        <div className="flex items-center justify-between bg-s1 border border-bd rounded-2xl p-6 mb-8">
          <TeamBlock name={clubName || 'فريقك'} logo={clubLogo} />
          <div className="flex flex-col items-center">
            <span className="text-[36px] font-black text-pri">
              {setsA} : {setsB}
            </span>
            <div className="flex gap-1.5 mt-2">
              {setScores.map((i) => (
                <span key={i} className="bg-bg px-2 py-1 rounded-md text-[11px] font-bold text-t2">
                  {match.sA[i]}:{match.sB[i]}
                </span>
              ))}
            </div>
          </div>
          <TeamBlock name={match.opponentName || 'المنافس'} logo={match.opponentLogo} />
        </div>

        {sideout.A.received > 0 && (
          <div className="flex items-center justify-between bg-s1 border border-bd rounded-2xl px-5 py-4 mb-4">
            <span className="text-[13px] font-extrabold">نسبة صد الإرسال</span>
            <span className="text-[20px] font-black text-pri">
              {sideout.A.pct}% <span className="text-[11px] text-t3 font-bold">({sideout.A.won}/{sideout.A.received})</span>
            </span>
          </div>
        )}

        <div className="text-[14px] font-extrabold mb-3">إجمالي المهارات — الفريق</div>
        <div className="bg-s1 border border-bd rounded-2xl p-5 mb-4">
          {SKILLS.map((s) => (
            <StatBar
              key={s.k}
              label={s.l}
              value={actions.filter((a) => a.skill === s.k).length}
              max={max}
              color={s.c}
            />
          ))}
        </div>

        <p className="text-[11px] text-t3">عدد اللاعبين المشاركين: {players.length}</p>
      </div>
    )
  },
)
CoverCard.displayName = 'CoverCard'

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
