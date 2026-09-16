import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { Logo } from '../brand/Logo'
import { Avatar } from '../shared/Avatar'

export function StartScheduledMatchScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { players } = useClubStore()
  const match = useMatchesStore((s) => (id ? s.matches[id] : undefined))
  const startScheduledMatch = useMatchesStore((s) => s.startScheduledMatch)

  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set(players.map((p) => p.id)))

  if (!id || !match || match.status !== 'scheduled') return <Navigate to="/results" replace />

  const togglePlayer = (pid: string) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return next
    })
  }

  const handleStart = () => {
    startScheduledMatch(id, Array.from(selectedPlayers))
    navigate(`/match/${id}/live`)
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="text-center pt-6 pb-5">
        <div className="mx-auto mb-2 w-14 h-14">
          <Logo size={56} />
        </div>
        <h1 className="text-[20px] font-black">بدء المباراة</h1>
        <p className="text-t2 text-[13px] mt-1">
          {match.opponentName} — {match.date}
        </p>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">
          👥 لاعبو اليوم ({selectedPlayers.size}/{players.length})
        </div>
        {players.length === 0 ? (
          <p className="text-[12px] text-t3">لا يوجد لاعبون في ملف النادي بعد. أضفهم من الإعدادات أولاً.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {players.map((p) => {
              const selected = selectedPlayers.has(p.id)
              return (
                <label
                  key={p.id}
                  className={`flex flex-col items-center gap-1.5 border rounded-xl px-2 pt-3 pb-2 cursor-pointer ${
                    selected ? 'bg-pri/10 border-pri' : 'bg-bg border-bd opacity-50'
                  }`}
                >
                  <input type="checkbox" checked={selected} onChange={() => togglePlayer(p.id)} className="hidden" />
                  <Avatar name={p.name} photo={p.photo} size={56} />
                  <span className="text-[12px] font-bold text-center leading-tight line-clamp-2">{p.name}</span>
                  {p.number != null && <span className="text-[10px] text-t3">#{p.number}</span>}
                </label>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={selectedPlayers.size < 2}
        className="block w-full py-4 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[17px] font-black mt-2 disabled:opacity-40 shadow-[0_6px_24px_rgba(16,185,129,0.2)]"
      >
        ▶ بداية مباراة
      </button>
    </div>
  )
}
