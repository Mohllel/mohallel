import { useEffect, useMemo, useState } from 'react'
import { fetchAllUsers, computeUserStatus, computeSignupGrowth, type AdminUserRow } from '../../lib/adminApi'
import { SignupGrowthChart } from './SignupGrowthChart'

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-s1 border border-bd p-3 text-center">
      <div className="text-[20px] font-black" style={{ color: color ?? 'var(--color-pri)' }}>
        {value}
      </div>
      <div className="text-[10px] text-t3 mt-0.5">{label}</div>
    </div>
  )
}

export function AdminDashboardTab() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : 'فشل تحميل البيانات'))
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    let active = 0
    let inactive = 0
    let incomplete = 0
    for (const u of users) {
      const status = computeUserStatus(u)
      if (status === 'active') active++
      else if (status === 'inactive') inactive++
      else incomplete++
    }
    return { active, inactive, incomplete }
  }, [users])

  const incompleteUsers = useMemo(
    () =>
      users
        .filter((u) => computeUserStatus(u) === 'incomplete')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [users],
  )

  const growth = useMemo(() => computeSignupGrowth(users), [users])

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>
  if (error) return <p className="text-center text-err text-[13px] mt-10">{error}</p>

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <StatCard label="إجمالي المشتركين" value={users.length} />
        <StatCard label="نشطون" value={counts.active} color="var(--color-ok)" />
        <StatCard label="غير نشطين" value={counts.inactive} color="var(--color-t2)" />
        <StatCard label="لم يكملوا الإعداد" value={counts.incomplete} color="var(--color-warn)" />
      </div>

      <SignupGrowthChart points={growth} />

      {incompleteUsers.length > 0 && (
        <div className="bg-s1 border border-bd p-4">
          <div className="text-[14px] font-extrabold mb-3">أحدث الحسابات غير المكتملة</div>
          {incompleteUsers.map((u) => (
            <div key={u.user_id} className="flex items-center gap-2 py-1.5 border-b border-bg last:border-b-0">
              <span className="flex-1 text-[12px] truncate">{u.email}</span>
              <span className="text-[10px] text-t3 shrink-0">{u.created_at.split('T')[0]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
