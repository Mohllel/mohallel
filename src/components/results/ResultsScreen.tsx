import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins, isMatchDecided } from '../../lib/scoring'

export function ResultsScreen() {
  const { matches } = useMatchesStore()
  const { clubName } = useClubStore()
  const list = Object.values(matches)
    .filter((m) => m.status === 'finished')
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">📋 نتائج المباريات</h2>

      {list.length === 0 && <p className="text-center text-t3 text-[13px] mt-10">لا توجد مباريات منتهية بعد.</p>}

      {list.map((m) => {
        const setsA = countSetWins(m.setWinners, 'A')
        const setsB = countSetWins(m.setWinners, 'B')
        const won = isMatchDecided(m.setWinners) === 'A'
        return (
          <Link
            key={m.id}
            to={`/match/${m.id}/report`}
            className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-2"
          >
            <span className={`w-1.5 self-stretch rounded-full ${won ? 'bg-ok' : 'bg-err'}`} />
            <div className="flex-1">
              <div className="text-[13px] font-extrabold">
                {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
              </div>
              <div className="text-[10px] text-t3">{m.date}</div>
            </div>
            <span className="text-[15px] font-black">
              {setsA}:{setsB}
            </span>
            <span className={`text-[10px] font-extrabold ${won ? 'text-ok' : 'text-err'}`}>{won ? 'فوز' : 'خسارة'}</span>
          </Link>
        )
      })}
    </div>
  )
}
