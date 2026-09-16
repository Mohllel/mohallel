import { Link } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { getNextMatch } from '../../lib/schedule'
import { VolleyballBanner } from './VolleyballBanner'

const ACTIONS = [
  { to: '/reports', icon: '📊', label: 'تقارير' },
  { to: '/analytics', icon: '🧠', label: 'تحليلات' },
  { to: '/standings', icon: '🏆', label: 'ترتيب الفريق' },
  { to: '/results', icon: '📋', label: 'المباريات' },
]

export function HomeScreen() {
  const { clubName, clubLogo, userName, headerImage } = useClubStore()
  const matches = useMatchesStore((s) => s.matches)
  const nextMatch = getNextMatch(matches)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="-mx-4 -mt-4 mb-4 h-40 overflow-hidden">
        {headerImage ? (
          <img src={headerImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <VolleyballBanner />
        )}
      </div>

      <div className="text-center pb-6">
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

      <Link
        to="/settings"
        className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-4"
      >
        <div className="w-12 h-12 rounded-xl bg-s2 border border-bl overflow-hidden flex items-center justify-center text-pri font-black shrink-0">
          {clubLogo ? <img src={clubLogo} alt="" className="w-full h-full object-cover" /> : '🏐'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold truncate">{clubName || 'أضف اسم ناديك'}</div>
          <div className="text-[11px] text-t3">{userName ? `مرحباً، ${userName}` : 'اضغط لإعداد ملف النادي'}</div>
        </div>
        <span className="text-t3 text-xs">✎ تعديل</span>
      </Link>

      {nextMatch && (
        <Link
          to={`/match/${nextMatch.id}/start`}
          className="flex items-center gap-3 bg-s1 border border-sec/40 rounded-2xl p-3 mb-4"
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
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border border-transparent bg-gradient-to-br from-ok to-[#059669] text-white shadow-[0_6px_20px_rgba(16,185,129,0.25)]"
        >
          <span className="text-2xl">▶</span>
          <span className="text-[13px] font-extrabold">مباراة جديدة</span>
        </Link>
        <Link
          to="/training"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border border-transparent bg-gradient-to-br from-err to-[#b91c1c] text-white shadow-[0_6px_20px_rgba(239,68,68,0.25)]"
        >
          <span className="text-2xl">🏋️</span>
          <span className="text-[13px] font-extrabold">تدريب</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border bg-s1 border-bd text-t1"
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-[13px] font-extrabold">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
