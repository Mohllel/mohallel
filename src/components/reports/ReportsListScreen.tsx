import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins } from '../../lib/scoring'

export function ReportsListScreen() {
  const { matches } = useMatchesStore()
  const { clubName } = useClubStore()
  const { competitions } = useReferenceDataStore()
  const list = Object.values(matches)
    .filter((m) => m.status !== 'scheduled')
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">📊 التقارير</h2>

      {list.length === 0 && (
        <p className="text-center text-t3 text-[13px] mt-10">لا توجد مباريات محفوظة بعد.</p>
      )}

      {list.map((m) => {
        const setsA = countSetWins(m.setWinners, 'A')
        const setsB = countSetWins(m.setWinners, 'B')
        return (
          <Link
            key={m.id}
            to={`/match/${m.id}/report`}
            className="block bg-s1 border border-bd rounded-2xl p-3 mb-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-extrabold">
                {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
              </span>
              <span className="text-[11px] text-t3">{m.date}</span>
            </div>
            {m.competitionId && competitions.find((c) => c.id === m.competitionId) && (
              <div className="text-[10px] text-t3 mb-1">🏆 {competitions.find((c) => c.id === m.competitionId)!.name}</div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-black text-pri">
                {setsA} : {setsB}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                m.status === 'finished' ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'
              }`}>
                {m.status === 'finished' ? 'انتهت' : 'جارية'}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
