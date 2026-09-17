import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import {
  fetchAllClubs,
  fetchAppSettings,
  fetchPlatformStats,
  setClubPro,
  updateAppSettings,
  type AdminClubRow,
  type AppSettings,
  type PlatformStats,
} from '../../lib/adminApi'

export function AdminScreen() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const [clubs, setClubs] = useState<AdminClubRow[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [settings, setSettings] = useState<AppSettings>({ maintenance_mode: false, announcement: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [clubsData, statsData, settingsData] = await Promise.all([
        fetchAllClubs(),
        fetchPlatformStats(),
        fetchAppSettings(),
      ])
      setClubs(clubsData)
      setStats(statsData)
      setSettings(settingsData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل بيانات لوحة المطوّر')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) loadAll()
  }, [isAdmin])

  if (!isAdmin) return <Navigate to="/settings" replace />

  const handleTogglePro = async (row: AdminClubRow) => {
    const next = !row.is_pro
    setClubs((prev) => prev.map((c) => (c.user_id === row.user_id ? { ...c, is_pro: next } : c)))
    try {
      await setClubPro(row.user_id, next)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل التعديل')
      setClubs((prev) => prev.map((c) => (c.user_id === row.user_id ? { ...c, is_pro: !next } : c)))
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await updateAppSettings(settings)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/settings')} className="text-[13px] font-bold text-pri">
          → رجوع
        </button>
        <h2 className="text-[18px] font-black flex-1 text-center">🛠 لوحة المطوّر</h2>
      </div>

      {loading && <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>}
      {error && <p className="text-center text-err text-[13px] mt-10">{error}</p>}

      {!loading && !error && (
        <>
          {stats && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatCard label="الأندية" value={stats.total_clubs} />
              <StatCard label="PRO" value={stats.total_pro} />
              <StatCard label="المباريات" value={stats.total_matches} />
            </div>
          )}

          <div className="bg-s1 border border-bd p-4 mb-4">
            <div className="text-[14px] font-extrabold mb-3">إعدادات عامة</div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-bold">وضع الصيانة</div>
              <button
                onClick={() => setSettings((s) => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
                className={`w-14 h-8 rounded-full relative transition-colors ${settings.maintenance_mode ? 'bg-err' : 'bg-bd'}`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.maintenance_mode ? 'right-1' : 'right-7'}`}
                />
              </button>
            </div>
            <label className="block text-[11px] text-t2 mb-1 font-bold">رسالة إعلان عامة (اتركها فاضية لإخفائها)</label>
            <textarea
              value={settings.announcement}
              onChange={(e) => setSettings((s) => ({ ...s, announcement: e.target.value }))}
              rows={2}
              className="w-full bg-bg border border-bd p-2 text-[13px] mb-3"
            />
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full py-2.5 bg-pri text-white font-extrabold text-[13px] disabled:opacity-40"
            >
              {savingSettings ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>

          <div className="bg-s1 border border-bd p-4">
            <div className="text-[14px] font-extrabold mb-3">الأندية المشتركة ({clubs.length})</div>
            {clubs.map((c) => (
              <div key={c.user_id} className="flex items-center gap-2 py-2 border-b border-bg last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate">{c.club_name || '(بلا اسم)'}</div>
                  <div className="text-[10px] text-t3 truncate">{c.email}</div>
                </div>
                <button
                  onClick={() => handleTogglePro(c)}
                  className={`px-3 py-1.5 text-[11px] font-extrabold ${c.is_pro ? 'bg-ok text-white' : 'bg-bd text-t2'}`}
                >
                  {c.is_pro ? 'PRO مفعّل' : 'PRO معطّل'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-s1 border border-bd p-3 text-center">
      <div className="text-[20px] font-black text-pri">{value}</div>
      <div className="text-[10px] text-t3 mt-0.5">{label}</div>
    </div>
  )
}
