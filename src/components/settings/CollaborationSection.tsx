import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { inviteClubMember, listClubMembers, removeClubMember, type ClubMember } from '../../lib/collaboration'

export function CollaborationSection() {
  const { user, activeClubId, memberships, setActiveClubId } = useAuthStore()
  const isOwnerView = activeClubId === user?.id

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">👥 التعاون بين المحللين</div>

      {memberships.length > 0 && (
        <div className="mb-3">
          <label className="block text-[11px] text-t2 mb-1 font-bold">تعمل الآن على نادي</label>
          <select value={activeClubId ?? ''} onChange={(e) => setActiveClubId(e.target.value)}>
            {user && <option value={user.id}>ناديك أنت</option>}
            {memberships.map((m) => (
              <option key={m.club_owner_id} value={m.club_owner_id}>
                {m.club_owner_email}
              </option>
            ))}
          </select>
        </div>
      )}

      {isOwnerView ? (
        <OwnerInvitePanel />
      ) : (
        <p className="text-[12px] text-t3">تعمل الآن كعضو مدعوّ — إدارة الدعوات متاحة لصاحب النادي فقط.</p>
      )}
    </div>
  )
}

function OwnerInvitePanel() {
  const [members, setMembers] = useState<ClubMember[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    listClubMembers()
      .then(setMembers)
      .catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const handleInvite = async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setError(null)
    setLoading(true)
    try {
      await inviteClubMember(trimmed)
      setEmail('')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشلت الدعوة')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (memberUserId: string) => {
    await removeClubMember(memberUserId)
    load()
  }

  return (
    <div>
      <p className="text-[10px] text-t3 mb-2">
        ادعُ محللاً آخر (مثل مساعد المدرب) للعمل معك على نفس بيانات ناديك لحظياً — يحتاج حساباً مسجَّلاً بالتطبيق مسبقاً.
      </p>
      {members.map((m) => (
        <div key={m.member_user_id} className="flex items-center gap-2 py-1.5 border-b border-bg last:border-b-0">
          <span className="flex-1 text-[12px] truncate">{m.email}</span>
          <button onClick={() => handleRemove(m.member_user_id)} className="text-err text-[11px] font-bold">
            إزالة
          </button>
        </div>
      ))}
      {error && <p className="text-[11px] text-err font-bold mt-2">{error}</p>}
      <div className="flex gap-1.5 mt-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          type="email"
          placeholder="بريد المحلل..."
          className="flex-1"
        />
        <button
          onClick={handleInvite}
          disabled={loading}
          className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px] disabled:opacity-40"
        >
          دعوة
        </button>
      </div>
    </div>
  )
}
