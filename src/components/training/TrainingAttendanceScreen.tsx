import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { Avatar } from '../shared/Avatar'
import { BackButton } from '../shared/BackButton'

export function TrainingAttendanceScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { players } = useClubStore()
  const session = useTrainingStore((s) => (id ? s.sessions[id] : undefined))
  const startScheduledSession = useTrainingStore((s) => s.startScheduledSession)

  const invited = players.filter((p) => session?.playerIds.includes(p.id))
  const [attended, setAttended] = useState<Set<string>>(new Set(session?.playerIds ?? []))

  if (!id || !session || session.status !== 'scheduled') return <Navigate to="/training" replace />

  const toggle = (pid: string) => {
    setAttended((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const handleStart = () => {
    startScheduledSession(id, Array.from(attended))
    navigate(`/training/${id}`)
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <BackButton to="/training" />
        <div className="flex-1">
          <h2 className="text-[18px] font-black">{session.title}</h2>
          <p className="text-[11px] text-t3">{session.date}</p>
        </div>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">
          ✅ تسجيل الحضور ({attended.size}/{invited.length})
        </div>
        {invited.length === 0 ? (
          <p className="text-[12px] text-t3">لا يوجد لاعبون مدعوّون بهذا التمرين.</p>
        ) : (
          invited.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-2.5 border rounded-xl px-2.5 py-2 mb-1.5 cursor-pointer ${
                attended.has(p.id) ? 'bg-ok/10 border-ok' : 'bg-bg border-bd opacity-50'
              }`}
            >
              <input type="checkbox" checked={attended.has(p.id)} onChange={() => toggle(p.id)} className="w-4 h-4" />
              <Avatar name={p.name} photo={p.photo} size={28} />
              <span className="flex-1 text-[13px] font-bold">{p.name}</span>
            </label>
          ))
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={attended.size === 0}
        className="block w-full py-4 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[17px] font-black mt-2 disabled:opacity-40"
      >
        ▶ بدء التمرين
      </button>
    </div>
  )
}
