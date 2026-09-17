import { useEffect, useState } from 'react'
import { fetchAllUsers, computeUserStatus, type AdminUserRow, type UserStatus } from '../../lib/adminApi'

const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  incomplete: 'غير مكتمل',
}
const STATUS_CLASS: Record<UserStatus, string> = {
  active: 'bg-ok/15 text-ok',
  inactive: 'bg-bd text-t2',
  incomplete: 'bg-warn/15 text-warn',
}

function shortDate(iso: string | null): string {
  return iso ? iso.split('T')[0] : '—'
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : 'فشل تحميل المستخدمين'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>
  if (error) return <p className="text-center text-err text-[13px] mt-10">{error}</p>

  return (
    <div className="bg-s1 border border-bd p-4">
      <div className="text-[14px] font-extrabold mb-3">كل المستخدمين ({users.length})</div>
      {users.map((u) => {
        const status = computeUserStatus(u)
        return (
          <div key={u.user_id} className="py-2.5 border-b border-bg last:border-b-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex-1 text-[13px] font-bold truncate">{u.email}</span>
              {u.is_admin && <span className="text-[10px] font-extrabold text-pri shrink-0">🛠 مطوّر</span>}
              <span className={`px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${STATUS_CLASS[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            </div>
            <div className="text-[10px] text-t3">
              سجّل: {shortDate(u.created_at)} — آخر دخول: {shortDate(u.last_sign_in_at)}
            </div>
            <div className="text-[10px] text-t3 mt-0.5">
              {u.owns_club ? '🏐 يملك نادياً' : null}
              {u.owns_club && u.member_of_emails?.length ? ' + ' : ''}
              {u.member_of_emails?.length ? `عضو لدى: ${u.member_of_emails.join('، ')}` : ''}
              {!u.owns_club && !u.member_of_emails?.length ? 'لا نادي ولا عضوية' : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
