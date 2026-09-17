import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins, isMatchDecided } from '../../lib/scoring'

export function ResultsScreen() {
  const { matches, createScheduledMatch, deleteMatch } = useMatchesStore()
  const { clubName, opponentPresets, addOpponentPreset, competitions } = useClubStore()
  const [showAdd, setShowAdd] = useState(false)
  const [opponentId, setOpponentId] = useState('')
  const [newOpponentName, setNewOpponentName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [competitionId, setCompetitionId] = useState('')

  const all = Object.values(matches)
  const scheduled = all.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))
  const finished = all.filter((m) => m.status === 'finished').sort((a, b) => b.createdAt - a.createdAt)

  const canAdd = opponentId === '__new__' ? newOpponentName.trim().length > 0 : opponentId !== ''

  const handleAdd = () => {
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
    createScheduledMatch(opponentName, opponentLogo, presetId, date, competitionId || null)
    setShowAdd(false)
    setOpponentId('')
    setNewOpponentName('')
    setDate(new Date().toISOString().split('T')[0])
    setCompetitionId('')
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-black">📋 المباريات</h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="px-3 py-1.5 bg-pri text-white rounded-lg text-[12px] font-extrabold"
        >
          {showAdd ? 'إغلاق' : '+ جدولة مباراة'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-s1 border border-bd rounded-2xl p-4 mb-4">
          <label className="block text-[11px] text-t2 mb-1 font-bold">الفريق المنافس</label>
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
          <label className="block text-[11px] text-t2 mb-1 font-bold">تاريخ المباراة</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-2" />
          {competitions.length > 0 && (
            <>
              <label className="block text-[11px] text-t2 mb-1 font-bold">المسابقة (اختياري)</label>
              <select value={competitionId} onChange={(e) => setCompetitionId(e.target.value)} className="mb-3">
                <option value="">— بلا مسابقة —</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-2.5 bg-ok text-white rounded-xl font-extrabold text-[13px] disabled:opacity-40"
          >
            📅 حجز الموعد
          </button>
        </div>
      )}

      {scheduled.length > 0 && (
        <>
          <div className="text-[12px] font-extrabold text-t2 mb-2">القادمة</div>
          {scheduled.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-2">
              <span className="w-1.5 self-stretch rounded-full bg-warn" />
              <div className="flex-1">
                <div className="text-[13px] font-extrabold">
                  {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
                </div>
                <div className="text-[10px] text-t3">
                  {m.date}
                  {m.competitionId && competitions.find((c) => c.id === m.competitionId) && (
                    <span> · 🏆 {competitions.find((c) => c.id === m.competitionId)!.name}</span>
                  )}
                </div>
              </div>
              <Link to={`/match/${m.id}/start`} className="px-3 py-1.5 bg-ok text-white rounded-lg text-[11px] font-extrabold">
                ▶ بدء
              </Link>
              <button
                onClick={() => confirm('إلغاء هذه المباراة المجدولة؟') && deleteMatch(m.id)}
                className="w-7 h-7 rounded bg-err/10 text-err text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </>
      )}

      <div className="text-[12px] font-extrabold text-t2 mb-2 mt-1">المنتهية</div>
      {finished.length === 0 && <p className="text-center text-t3 text-[13px] mt-6">لا توجد مباريات منتهية بعد.</p>}

      {finished.map((m) => {
        const setsA = countSetWins(m.setWinners, 'A')
        const setsB = countSetWins(m.setWinners, 'B')
        const won = isMatchDecided(m.setWinners) === 'A'
        return (
          <Link
            key={m.id}
            to={`/match/${m.id}/report`}
            className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-2"
          >
            <span className={`w-1.5 self-stretch rounded-full ${won ? 'bg-ok' : 'bg-err'}`} />
            <div className="flex-1">
              <div className="text-[13px] font-extrabold">
                {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
              </div>
              <div className="text-[10px] text-t3">
                {m.date}
                {m.competitionId && competitions.find((c) => c.id === m.competitionId) && (
                  <span> · 🏆 {competitions.find((c) => c.id === m.competitionId)!.name}</span>
                )}
              </div>
            </div>
            <span className="text-[15px] font-black">
              {setsA}:{setsB}
            </span>
            <span className={`text-[10px] font-extrabold ${won ? 'text-ok' : 'text-err'}`}>{won ? 'فوز' : 'خسارة'}</span>
          </Link>
        )
      })}
    </div>
  )
}
