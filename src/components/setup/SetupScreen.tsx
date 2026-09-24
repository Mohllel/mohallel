import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { countSetWins } from '../../lib/scoring'
import { Logo } from '../brand/Logo'
import { BackButton } from '../shared/BackButton'
import type { Match } from '../../types/domain'
import type { CompetitionPreset } from '../../store/useClubStore'

export function SetupScreen() {
  const { clubName } = useClubStore()
  const { clubs: opponentPresets, competitions } = useReferenceDataStore()
  const { matches, createScheduledMatch, deleteMatch } = useMatchesStore()

  const [competitionId, setCompetitionId] = useState<string>('')
  const [round, setRound] = useState('')
  const [opponentId, setOpponentId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [venue, setVenue] = useState('')

  const selectedCompetition = competitions.find((c) => c.id === competitionId) ?? null
  const availableOpponents = selectedCompetition?.eligibleOpponentIds?.length
    ? opponentPresets.filter((p) => selectedCompetition.eligibleOpponentIds!.includes(p.id))
    : opponentPresets

  const live = Object.values(matches)
    .filter((m) => m.status === 'live')
    .sort((a, b) => b.createdAt - a.createdAt)
  const scheduled = Object.values(matches)
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date))

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
    setCompetitionId('')
    setRound('')
    setOpponentId('')
    setDate(new Date().toISOString().split('T')[0])
    setVenue('')
  }

  const canAdd = opponentId !== ''

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="pt-3">
        <BackButton />
      </div>

      <div className="text-center pb-5">
        <div className="mx-auto mb-2 w-14 h-14">
          <Logo size={56} />
        </div>
        <h1 className="text-[20px] font-black">🏐 المباريات</h1>
      </div>

      {live.length > 0 && (
        <div className="mb-3">
          <div className="text-[12px] font-extrabold text-t2 mb-2">🔴 جارية الآن</div>
          {live.map((m) => (
            <Link
              key={m.id}
              to={`/match/${m.id}/live`}
              className="flex items-center gap-3 bg-s1 border border-warn/40 rounded-2xl p-3 mb-2"
            >
              <span className="w-1.5 self-stretch rounded-full bg-warn" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold truncate">
                  {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
                </div>
                <MatchMeta match={m} competitions={competitions} />
              </div>
              <span className="text-[15px] font-black shrink-0">
                {countSetWins(m.setWinners, 'A')}:{countSetWins(m.setWinners, 'B')}
              </span>
              <span className="text-[10px] font-extrabold text-warn shrink-0">▶ متابعة</span>
            </Link>
          ))}
        </div>
      )}

      {scheduled.length > 0 && (
        <div className="mb-3">
          <div className="text-[12px] font-extrabold text-t2 mb-2">🗓 القادمة</div>
          {scheduled.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold truncate">
                  {clubName || 'فريقك'} <span className="text-t3 font-normal">vs</span> {m.opponentName}
                </div>
                <MatchMeta match={m} competitions={competitions} />
              </div>
              <Link to={`/match/${m.id}/start`} className="px-3 py-1.5 bg-ok text-white rounded-lg text-[11px] font-extrabold shrink-0">
                ▶ ابدأ الآن
              </Link>
              <button
                onClick={() => confirm('إلغاء هذه المباراة المجدولة؟') && deleteMatch(m.id)}
                className="w-7 h-7 rounded bg-err/10 text-err text-xs flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-s1 border border-bd rounded-2xl p-4">
        <div className="text-[14px] font-extrabold mb-3">➕ مباراة جديدة</div>

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

function MatchMeta({ match, competitions }: { match: Match; competitions: CompetitionPreset[] }) {
  const competition = match.competitionId ? competitions.find((c) => c.id === match.competitionId) : null
  const parts = [match.date]
  if (competition) parts.push(`🏆 ${competition.name}`)
  if (match.round) parts.push(`🔢 ${match.round}`)
  if (match.venue) parts.push(`📍 ${match.venue}`)
  return <div className="text-[10px] text-t3 truncate">{parts.join(' · ')}</div>
}
