import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins } from '../../lib/scoring'
import { BackButton } from '../shared/BackButton'
import type { Match } from '../../types/domain'
import type { CompetitionPreset } from '../../store/useClubStore'

export function SetupScreen() {
  const { clubName } = useClubStore()
  const { competitions } = useReferenceDataStore()
  const { matches, deleteMatch } = useMatchesStore()

  const live = Object.values(matches)
    .filter((m) => m.status === 'live')
    .sort((a, b) => b.createdAt - a.createdAt)
  const scheduled = Object.values(matches)
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center justify-between mb-5">
        <BackButton />
        <h1 className="text-[18px] font-black">🏐 المباريات</h1>
        <Link
          to="/match/schedule"
          className="px-3 py-2 bg-s1 border border-bd rounded-lg text-[12px] font-extrabold text-pri whitespace-nowrap"
        >
          🗓 جدولة جديدة
        </Link>
      </div>

      {live.length > 0 && (
        <div className="mb-3">
          <div className="text-[12px] font-extrabold text-t2 mb-2">🔴 جارية الآن</div>
          {live.map((m) => (
            <Link
              key={m.id}
              to={`/match/${m.id}/live`}
              className="flex items-center gap-3 bg-s1 border border-warn/40 rounded-2xl p-3 mb-2"
            >
              <span className="w-1.5 self-stretch rounded-full bg-warn" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold truncate">
                  {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
                </div>
                <MatchMeta match={m} competitions={competitions} />
              </div>
              <span className="text-[15px] font-black shrink-0">
                {countSetWins(m.setWinners, 'A')}:{countSetWins(m.setWinners, 'B')}
              </span>
              <span className="text-[10px] font-extrabold text-warn shrink-0">▶ متابعة</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mb-3">
        <div className="text-[12px] font-extrabold text-t2 mb-2">🗓 القادمة</div>
        {scheduled.length === 0 ? (
          <p className="text-center text-t3 text-[13px] mt-6">
            لا توجد مباريات قادمة — اضغط "جدولة جديدة" بالأعلى لإضافة واحدة.
          </p>
        ) : (
          scheduled.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold truncate">
                  {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
                </div>
                <MatchMeta match={m} competitions={competitions} />
              </div>
              <Link to={`/match/${m.id}/start`} className="px-3 py-1.5 bg-ok text-white rounded-lg text-[11px] font-extrabold shrink-0">
                ▶ ابدأ الآن
              </Link>
              <button
                onClick={() => confirm('إلغاء هذه المباراة المجدولة؟') && deleteMatch(m.id)}
                className="w-7 h-7 rounded bg-err/10 text-err text-xs flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MatchMeta({ match, competitions }: { match: Match; competitions: CompetitionPreset[] }) {
  const competition = match.competitionId ? competitions.find((c) => c.id === match.competitionId) : null
  const parts = [match.date]
  if (competition) parts.push(`🏆 ${competition.name}`)
  if (match.round) parts.push(`🔢 ${match.round}`)
  if (match.venue) parts.push(`📍 ${match.venue}`)
  return <div className="text-[10px] text-t3 truncate">{parts.join(' · ')}</div>
}
