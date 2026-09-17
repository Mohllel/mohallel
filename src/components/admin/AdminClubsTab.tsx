import { useEffect, useState } from 'react'
import { fetchAllClubs, setClubPro, type AdminClubRow } from '../../lib/adminApi'

export function AdminClubsTab() {
  const [clubs, setClubs] = useState<AdminClubRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllClubs()
      .then(setClubs)
      .catch((e) => setError(e instanceof Error ? e.message : 'فشل تحميل الأندية'))
      .finally(() => setLoading(false))
  }, [])

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

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>
  if (error) return <p className="text-center text-err text-[13px] mt-10">{error}</p>

  return (
    <div className="bg-s1 border border-bd p-4">
      <div className="text-[14px] font-extrabold mb-3">الأندية المشتركة ({clubs.length})</div>
      {clubs.map((c) => (
        <div key={c.user_id} className="flex items-center gap-2 py-2 border-b border-bg last:border-b-0">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold truncate">{c.club_name || '(بلا اسم)'}</div>
            <div className="text-[10px] text-t3 truncate">{c.email}</div>
            {c.member_count > 0 && (
              <div className="text-[10px] text-pri font-bold mt-0.5">👥 {c.member_count} محلّلين</div>
            )}
          </div>
          <button
            onClick={() => handleTogglePro(c)}
            className={`px-3 py-1.5 text-[11px] font-extrabold shrink-0 ${c.is_pro ? 'bg-ok text-white' : 'bg-bd text-t2'}`}
          >
            {c.is_pro ? 'PRO مفعّل' : 'PRO معطّل'}
          </button>
        </div>
      ))}
    </div>
  )
}
