import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { BackButton } from '../shared/BackButton'

export function ScheduleMatchScreen() {
  const navigate = useNavigate()
  const { clubs: opponentPresets, competitions } = useReferenceDataStore()
  const { createScheduledMatch } = useMatchesStore()

  const [competitionId, setCompetitionId] = useState<string>('')
  const [round, setRound] = useState('')
  const [opponentId, setOpponentId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [venue, setVenue] = useState('')

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

  const handleAdd = () => {
    const preset = opponentPresets.find((p) => p.id === opponentId)
    if (!preset) return
    createScheduledMatch(preset.name, preset.logo, preset.id, date, competitionId || null, round.trim() || null, venue.trim() || null)
    navigate('/match/new')
  }

  const canAdd = opponentId !== ''

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <BackButton to="/match/new" />
        <h2 className="text-[18px] font-black flex-1">🗓 جدولة مباراة جديدة</h2>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4">
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
        <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="اسم الملعب أو المكان" className="mb-2" />

        {opponentId && (
          <Link
            to={`/scouting/${opponentId}`}
            className="block text-center mb-2 py-2 bg-bg border border-bd rounded-lg text-[12px] font-bold text-pri"
          >
            📋 عرض استطلاع المنافس
          </Link>
        )}

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="block w-full py-3.5 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[15px] font-black disabled:opacity-40 shadow-[0_6px_24px_rgba(16,185,129,0.2)]"
        >
          📅 إضافة المباراة
        </button>
      </div>
    </div>
  )
}
