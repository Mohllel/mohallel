import { Link } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { useClubStore } from '../../store/useClubStore'

const ACTIONS = [
  { to: '/match/new', icon: '▶', label: 'مباراة جديدة', accent: true },
  { to: '/reports', icon: '📊', label: 'تقارير' },
  { to: '/analytics', icon: '🧠', label: 'تحليلات' },
  { to: '/standings', icon: '🏆', label: 'ترتيب الفريق' },
  { to: '/results', icon: '📋', label: 'نتائج المباريات' },
  { to: '/training', icon: '🏋️', label: 'تدريب' },
]

export function HomeScreen() {
  const { clubName, clubLogo, userName } = useClubStore()

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="text-center pt-8 pb-6">
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

      <div className="grid grid-cols-2 gap-2.5">
        {ACTIONS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-6 border ${
              a.accent
                ? 'col-span-2 bg-gradient-to-br from-ok to-[#059669] border-transparent text-white'
                : 'bg-s1 border-bd text-t1'
            }`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-[13px] font-extrabold">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
