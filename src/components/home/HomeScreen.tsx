import { Link } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { getNextMatch } from '../../lib/schedule'
import { isMatchDecided } from '../../lib/scoring'
import { HomeStats } from './HomeStats'
import { VolleyballBanner } from './VolleyballBanner'

const ACTIONS = [
  { to: '/reports', icon: '📊', label: 'تقارير' },
  { to: '/analytics', icon: '🧠', label: 'تحليلات' },
  { to: '/standings', icon: '🏆', label: 'ترتيب الفريق' },
  { to: '/results', icon: '📋', label: 'المباريات' },
]

export function HomeScreen() {
  const { clubName, headerImage, players } = useClubStore()
  const matches = useMatchesStore((s) => s.matches)
  const nextMatch = getNextMatch(matches)

  const finishedMatches = Object.values(matches).filter((m) => m.status === 'finished')
  const wins = finishedMatches.filter((m) => isMatchDecided(m.setWinners) === 'A').length
  const winRate = finishedMatches.length ? Math.round((wins / finishedMatches.length) * 100) : 0

  return (
    <div className="p-4">
      <div className="-mx-4 -mt-4 mb-4 h-40 overflow-hidden">
        {headerImage ? (
          <img
            key={headerImage}
            src={headerImage}
            alt=""
            className="w-full h-full object-cover animate-[coverZoom_1s_ease-out_both]"
          />
        ) : (
          <VolleyballBanner />
        )}
      </div>

      <div className="text-center pb-5 animate-[fadeIn_.5s_ease_both]">
        <div className="mx-auto mb-3 w-16 h-16">
          <Logo size={64} />
        </div>
        <h1 className="text-[26px] font-black">
          <span className="bg-gradient-to-br from-pri to-sec bg-clip-text text-transparent">مُحلّل</span>
        </h1>
        <p className="text-t2 text-[13px] mt-1">
          منصة تحليل مباريات كرة الطائرة — سجّل، حلّل، وارتقِ بأداء فريقك
        </p>
      </div>

      <HomeStats matchesPlayed={finishedMatches.length} winRate={winRate} playersCount={players.length} />

      {nextMatch && (
        <Link
          to={`/match/${nextMatch.id}/start`}
          className="flex items-center gap-3 bg-s1 border border-sec/40 rounded-2xl p-3 mb-4 animate-[fadeIn_.5s_ease_both]"
          style={{ animationDelay: '270ms' }}
        >
          <div className="w-11 h-11 rounded-xl bg-s2 border border-bl overflow-hidden flex items-center justify-center text-pri font-black shrink-0">
            {nextMatch.opponentLogo ? (
              <img src={nextMatch.opponentLogo} alt="" className="w-full h-full object-cover" />
            ) : (
              '🆚'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-sec mb-0.5">المباراة القادمة</div>
            <div className="text-[14px] font-extrabold truncate">
              {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {nextMatch.opponentName}
            </div>
            <div className="text-[11px] text-t3">{nextMatch.date}</div>
          </div>
          <span className="px-3 py-1.5 bg-ok text-white rounded-lg text-[11px] font-extrabold shrink-0">
            ▶ بدء المباراة
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <Link
          to="/match/new"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border border-transparent bg-gradient-to-br from-ok to-[#059669] text-white shadow-[0_6px_20px_rgba(16,185,129,0.25)] animate-[fadeIn_.5s_ease_both]"
          style={{ animationDelay: '340ms' }}
        >
          <span className="text-2xl">▶</span>
          <span className="text-[13px] font-extrabold">مباراة جديدة</span>
        </Link>
        <Link
          to="/training"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border border-transparent bg-gradient-to-br from-err to-[#b91c1c] text-white shadow-[0_6px_20px_rgba(239,68,68,0.25)] animate-[fadeIn_.5s_ease_both]"
          style={{ animationDelay: '400ms' }}
        >
          <span className="text-2xl">🏋️</span>
          <span className="text-[13px] font-extrabold">تدريب</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map((a, i) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border bg-s1 border-bd text-t1 animate-[fadeIn_.5s_ease_both]"
            style={{ animationDelay: `${460 + i * 60}ms` }}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-[13px] font-extrabold">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
