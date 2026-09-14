import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { computeStandings } from '../../lib/standings'

export function StandingsScreen() {
  const { matches } = useMatchesStore()
  const { clubName } = useClubStore()
  const rows = computeStandings(Object.values(matches), clubName)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">🏆 ترتيب الفريق</h2>

      {rows.length === 0 ? (
        <p className="text-center text-t3 text-[13px] mt-10">لا توجد مباريات منتهية بعد لحساب الترتيب.</p>
      ) : (
        <div className="bg-s1 border border-bd rounded-2xl overflow-hidden">
          <div className="flex px-2 py-2 bg-s2 border-b border-bd text-[10px] font-extrabold text-t2">
            <span className="flex-[2] text-right">الفريق</span>
            <span className="flex-1 text-center">لعب</span>
            <span className="flex-1 text-center">فوز</span>
            <span className="flex-1 text-center">خسارة</span>
            <span className="flex-1 text-center">الأشواط</span>
            <span className="flex-1 text-center">نقاط</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.team}
              className={`flex px-2 py-2 border-b border-bd last:border-b-0 text-[12px] ${
                r.team === (clubName || 'فريقك') ? 'bg-pri/10' : ''
              }`}
            >
              <span className="flex-[2] text-right font-bold truncate">
                {i + 1}. {r.team}
              </span>
              <span className="flex-1 text-center">{r.played}</span>
              <span className="flex-1 text-center text-ok">{r.won}</span>
              <span className="flex-1 text-center text-err">{r.lost}</span>
              <span className="flex-1 text-center">
                {r.setsFor}-{r.setsAgainst}
              </span>
              <span className="flex-1 text-center font-extrabold text-pri">{r.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
