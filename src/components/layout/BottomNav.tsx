import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', icon: '🏠', label: 'الرئيسية' },
  { to: '/reports', icon: '📊', label: 'تقارير' },
  { to: '/analytics', icon: '🧠', label: 'تحليلات' },
  { to: '/standings', icon: '🏆', label: 'الترتيب' },
  { to: '/settings', icon: '⚙', label: 'الإعدادات' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-s1/97 backdrop-blur-md border-t border-bd">
      <div className="max-w-[720px] mx-auto flex">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${
                isActive ? 'text-pri' : 'text-t3'
              }`
            }
          >
            <span className="text-base leading-none">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
