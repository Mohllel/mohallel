import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { Logo } from '../brand/Logo'
import { Avatar } from '../shared/Avatar'

export function SetupScreen() {
  const navigate = useNavigate()
  const { players } = useClubStore()
  const { clubs: opponentPresets, competitions } = useReferenceDataStore()
  const { createMatch } = useMatchesStore()

  const [competitionId, setCompetitionId] = useState<string>('')
  const [round, setRound] = useState('')
  const [opponentId, setOpponentId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [venue, setVenue] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set(players.map((p) => p.id)))

  const selectedCompetition = competitions.find((c) => c.id === competitionId) ?? null
  const availableOpponents = selectedCompetition?.eligibleOpponentIds?.length
    ? opponentPresets.filter((p) => selectedCompetition.eligibleOpponentIds!.includes(p.id))
    : opponentPresets

  const handleCompetitionChange = (id: string) => {
    setCompetitionId(id)
    const competition = competitions.find((c) => c.id === id)
    if (competition?.eligibleOpponentIds?.length && !competition.eligibleOpponentIds.includes(opponentId)) {
      setOpponentId('')
    }
  }

  const togglePlayer = (id: string) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleStart = () => {
    const preset = opponentPresets.find((p) => p.id === opponentId)
    if (!preset) return
    const id = createMatch(
      preset.name,
      preset.logo,
      preset.id,
      date,
      Array.from(selectedPlayers),
      competitionId || null,
      round.trim() || null,
      venue.trim() || null,
    )
    navigate(`/match/${id}/live`)
  }

  const canStart = opponentId !== '' && selectedPlayers.size >= 2

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="text-center pt-6 pb-5">
        <div className="mx-auto mb-2 w-14 h-14">
          <Logo size={56} />
        </div>
        <h1 className="text-[20px] font-black">مباراة جديدة</h1>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">⚡ تفاصيل المباراة</div>

        {competitions.length > 0 && (
          <>
            <label className="block text-[11px] text-t2 mb-1 font-bold">اسم المسابقة (اختياري)</label>
            <select value={competitionId} onChange={(e) => handleCompetitionChange(e.target.value)} className="mb-2">
              <option value="">— بلا مسابقة —</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="block text-[11px] text-t2 mb-1 font-bold">الجولة (اختياري)</label>
        <input value={round} onChange={(e) => setRound(e.target.value)} placeholder="مثال: الجولة الثالثة" className="mb-2" />

        <label className="block text-[11px] text-t2 mb-1 font-bold">الفريق المنافس</label>
        <select value={opponentId} onChange={(e) => setOpponentId(e.target.value)} className="mb-2">
          <option value="">— اختر —</option>
          {availableOpponents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {opponentPresets.length === 0 && (
          <p className="text-[10px] text-t3 mb-2">
            لا توجد أندية بعد — اطلب من المطوّر إضافتها من لوحة التحكم.
          </p>
        )}

        <label className="block text-[11px] text-t2 mb-1 font-bold">التاريخ</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-2" />

        <label className="block text-[11px] text-t2 mb-1 font-bold">الملعب (اختياري)</label>
        <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="اسم الملعب أو المكان" />

        {opponentId && (
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
