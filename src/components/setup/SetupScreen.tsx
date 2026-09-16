import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { Logo } from '../brand/Logo'
import { Avatar } from '../shared/Avatar'

export function SetupScreen() {
  const navigate = useNavigate()
  const { players, opponentPresets, addOpponentPreset } = useClubStore()
  const { createMatch } = useMatchesStore()

  const [opponentId, setOpponentId] = useState<string>('')
  const [newOpponentName, setNewOpponentName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set(players.map((p) => p.id)))

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleStart = () => {
    let opponentName = ''
    let opponentLogo: string | null = null
    let presetId: string | null = null
    if (opponentId === '__new__') {
      opponentName = newOpponentName.trim()
      if (!opponentName) return
      presetId = addOpponentPreset(opponentName)
    } else {
      const preset = opponentPresets.find((p) => p.id === opponentId)
      if (!preset) return
      opponentName = preset.name
      opponentLogo = preset.logo
      presetId = preset.id
    }
    const id = createMatch(opponentName, opponentLogo, presetId, date, Array.from(selectedPlayers))
    navigate(`/match/${id}/live`)
  }

  const canStart =
    (opponentId === '__new__' ? newOpponentName.trim().length > 0 : opponentId !== '') &&
    selectedPlayers.size >= 2

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="text-center pt-6 pb-5">
        <div className="mx-auto mb-2 w-14 h-14">
          <Logo size={56} />
        </div>
        <h1 className="text-[20px] font-black">مباراة جديدة</h1>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">⚡ المنافس</div>
        <label className="block text-[11px] text-t2 mb-1 font-bold">اختر الفريق المنافس</label>
        <select value={opponentId} onChange={(e) => setOpponentId(e.target.value)} className="mb-2">
          <option value="">— اختر —</option>
          {opponentPresets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value="__new__">+ فريق جديد…</option>
        </select>
        {opponentId === '__new__' && (
          <input
            value={newOpponentName}
            onChange={(e) => setNewOpponentName(e.target.value)}
            placeholder="اسم الفريق المنافس"
            className="mb-2"
          />
        )}
        <label className="block text-[11px] text-t2 mb-1 font-bold">التاريخ</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        {opponentId && opponentId !== '__new__' && (
          <Link
            to={`/scouting/${opponentId}`}
            className="block text-center mt-3 py-2 bg-bg border border-bd rounded-lg text-[12px] font-bold text-pri"
          >
            📋 عرض استطلاع المنافس قبل البدء
          </Link>
        )}
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">
          👥 لاعبو اليوم ({selectedPlayers.size}/{players.length})
        </div>
        {players.length === 0 ? (
          <p className="text-[12px] text-t3">
            لا يوجد لاعبون في ملف النادي بعد. أضفهم من الإعدادات أولاً.
          </p>
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
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => togglePlayer(p.id)}
                    className="hidden"
                  />
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
        disabled={!canStart}
        className="block w-full py-4 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[17px] font-black mt-2 disabled:opacity-40 shadow-[0_6px_24px_rgba(16,185,129,0.2)]"
      >
        ▶ بدء التحليل
      </button>
    </div>
  )
}
