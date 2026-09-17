import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { AdminDashboardTab } from './AdminDashboardTab'
import { AdminClubsTab } from './AdminClubsTab'
import { AdminUsersTab } from './AdminUsersTab'
import { AdminSettingsTab } from './AdminSettingsTab'

const TABS = [
  { id: 'dashboard', label: '🏠 الرئيسية' },
  { id: 'clubs', label: '🆚 الأندية' },
  { id: 'users', label: '👥 المستخدمين' },
  { id: 'settings', label: '⚙ الإعدادات' },
] as const

type TabId = (typeof TABS)[number]['id']

export function AdminScreen() {
  const navigate = useNavigate()
  const { isAdmin, adminChecked, setViewMode, signOut } = useAuthStore()
  const [tab, setTab] = useState<TabId>('dashboard')

  if (!adminChecked) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحقق...</p>
  if (!isAdmin) return <Navigate to="/settings" replace />

  const goToClubMode = () => {
    setViewMode('club')
    navigate('/')
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={goToClubMode} className="text-[12px] font-bold text-pri whitespace-nowrap">
          🏐 وضع النادي
        </button>
        <h2 className="text-[16px] font-black flex-1 text-center truncate">🛠 لوحة المطوّر</h2>
        <button onClick={signOut} className="text-[12px] font-bold text-err whitespace-nowrap">
          خروج
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2 text-[12px] font-extrabold whitespace-nowrap ${
              tab === t.id ? 'bg-pri text-white' : 'bg-s1 border border-bd text-t2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <AdminDashboardTab />}
      {tab === 'clubs' && <AdminClubsTab />}
      {tab === 'users' && <AdminUsersTab />}
      {tab === 'settings' && <AdminSettingsTab />}
    </div>
  )
}
