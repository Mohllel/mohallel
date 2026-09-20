import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins, isMatchDecided } from '../../lib/scoring'
import type { Match } from '../../types/domain'
import type { CompetitionPreset } from '../../store/useClubStore'

export function ResultsScreen() {
  const { matches, createScheduledMatch, deleteMatch } = useMatchesStore()
  const { clubName } = useClubStore()
  const { clubs: opponentPresets, competitions } = useReferenceDataStore()
  const [showAdd, setShowAdd] = useState(false)
  const [competitionId, setCompetitionId] = useState('')
  const [round, setRound] = useState('')
  const [opponentId, setOpponentId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [venue, setVenue] = useState('')

  const all = Object.values(matches)
  const scheduled = all.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))
  const finished = all.filter((m) => m.status === 'finished').sort((a, b) => b.createdAt - a.createdAt)

  const canAdd = opponentId !== ''

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
    setShowAdd(false)
    setCompetitionId('')
    setRound('')
    setOpponentId('')
    setDate(new Date().toISOString().split('T')[0])
    setVenue('')
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

          <label className="block text-[11px] text-t2 mb-1 font-bold">تاريخ المباراة</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-2" />

          <label className="block text-[11px] text-t2 mb-1 font-bold">الملعب (اختياري)</label>
          <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="اسم الملعب أو المكان" className="mb-3" />

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
                <MatchMeta match={m} competitions={competitions} />
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
              <MatchMeta match={m} competitions={competitions} />
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

function MatchMeta({ match, competitions }: { match: Match; competitions: CompetitionPreset[] }) {
  const competition = match.competitionId ? competitions.find((c) => c.id === match.competitionId) : null
  const parts = [match.date]
  if (competition) parts.push(`🏆 ${competition.name}`)
  if (match.round) parts.push(`🔢 ${match.round}`)
  if (match.venue) parts.push(`📍 ${match.venue}`)
  return <div className="text-[10px] text-t3">{parts.join(' · ')}</div>
}
