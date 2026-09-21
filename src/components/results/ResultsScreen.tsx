import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins, isMatchDecided } from '../../lib/scoring'
import type { Match } from '../../types/domain'
import type { CompetitionPreset } from '../../store/useClubStore'

export function ResultsScreen() {
  const { matches } = useMatchesStore()
  const { clubName } = useClubStore()
  const { competitions } = useReferenceDataStore()

  const finished = Object.values(matches)
    .filter((m) => m.status === 'finished')
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">📋 المباريات المنتهية</h2>

      {finished.length === 0 && <p className="text-center text-t3 text-[13px] mt-6">لا توجد مباريات منتهية بعد.</p>}

      {finished.map((m) => {
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
              <MatchMeta match={m} competitions={competitions} />
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

function MatchMeta({ match, competitions }: { match: Match; competitions: CompetitionPreset[] }) {
  const competition = match.competitionId ? competitions.find((c) => c.id === match.competitionId) : null
  const parts = [match.date]
  if (competition) parts.push(`🏆 ${competition.name}`)
  if (match.round) parts.push(`🔢 ${match.round}`)
  if (match.venue) parts.push(`📍 ${match.venue}`)
  return <div className="text-[10px] text-t3">{parts.join(' · ')}</div>
}
