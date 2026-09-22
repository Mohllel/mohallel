import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { SKILLS, skillByKey } from '../../constants/skills'
import { qualityByValue } from '../../constants/quality'
import { cellCount, playerStats } from '../../lib/stats'
import type { Quality, SkillKey } from '../../types/domain'
import { QualityPopup } from '../live/QualityPopup'
import { BackButton } from '../shared/BackButton'

interface PendingQuality {
  rect: DOMRect
  playerId: string
  skill: SkillKey
}

export function TrainingSessionScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const session = useTrainingStore((s) => (id ? s.sessions[id] : undefined))
  const { addRep, undoLastRep, lastRepId } = useTrainingStore()
  const { players } = useClubStore()
  const [pending, setPending] = useState<PendingQuality | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  if (!id || !session) {
    return (
      <div className="p-6 text-center text-t3">
        <p className="mb-4">لم يتم العثور على هذا التمرين.</p>
        <button onClick={() => navigate('/training')} className="text-pri font-bold">
          العودة للتدريب
        </button>
      </div>
    )
  }

  const attendedIds = session.attendedPlayerIds ?? session.playerIds
  const participants = players.filter((p) => attendedIds.includes(p.id))
  const undoId = lastRepId(id)
  const lastRep = undoId ? session.reps.find((r) => r.id === undoId) : null

  const pickQuality = (q: Quality) => {
    if (!pending) return
    addRep(id, { playerId: pending.playerId, skill: pending.skill, quality: q })
    setPending(null)
  }

  return (
    <div className="p-3 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-3">
        <BackButton to="/training" />
        <div className="flex-1">
          <h2 className="text-[16px] font-black">{session.title}</h2>
          <p className="text-[10px] text-t3">{session.date}</p>
        </div>
        <button
          onClick={() => setShowSummary((v) => !v)}
          className="px-3 py-2 bg-s2 border border-bd rounded-lg text-[11px] font-bold text-pri"
        >
          {showSummary ? '📋 التسجيل' : '📊 الملخص'}
        </button>
      </div>

      {!showSummary ? (
        <div className="p-1 overflow-x-auto">
          <table className="w-full border-separate [border-spacing:3px]">
            <thead>
              <tr>
                <th className="min-w-[70px] text-right text-[9px] font-extrabold text-t3">اللاعب</th>
                {SKILLS.map((s) => (
                  <th key={s.k} className="min-w-[38px] text-[9px] font-extrabold text-t3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mb-0.5" style={{ background: s.c }} />
                    <br />
                    {s.k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id}>
                  <td className="px-2 py-1.5 text-[12px] font-bold whitespace-nowrap sticky right-0 bg-s1 rounded-lg min-w-[70px]">
                    {p.name.split(' ')[0]}
                  </td>
                  {SKILLS.map((s) => {
                    const count = cellCount(session.reps, p.id, s.k)
                    return (
                      <td key={s.k} className="p-0 text-center align-middle">
                        <button
                          onClick={(e) => setPending({ rect: e.currentTarget.getBoundingClientRect(), playerId: p.id, skill: s.k })}
                          style={count ? { borderColor: 'var(--color-bl)', color: s.c } : undefined}
                          className="w-full min-w-9 h-[42px] rounded-lg bg-s1 border-[1.5px] border-bd text-t2 text-[13px] font-extrabold flex items-center justify-center"
                        >
                          {count || ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {participants.map((p) => {
            const stats = playerStats(session.reps, p.id)
            return (
              <div key={p.id} className="bg-s1 border border-bd rounded-2xl p-3 mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] font-extrabold">{p.name}</span>
                  <span className="text-[11px] text-t3">{stats.tot} تكرار</span>
                </div>
                {SKILLS.filter((s) => stats[s.k].t > 0).map((s) => (
                  <div key={s.k} className="flex justify-between text-[11px] py-0.5">
                    <span style={{ color: s.c }} className="font-bold">
                      {s.l}
                    </span>
                    <span className="text-t2">
                      {stats[s.k].t} — متوسط {stats[s.k].avg}
                    </span>
                  </div>
                ))}
                {stats.tot === 0 && <p className="text-[11px] text-t3">لا تكرارات مسجَّلة بعد.</p>}
              </div>
            )
          })}
        </div>
      )}

      {pending && (
        <QualityPopup anchorRect={pending.rect} onPick={pickQuality} onClose={() => setPending(null)} />
      )}

      {lastRep && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-s1 border border-bl rounded-2xl px-4 py-2.5 flex items-center gap-3 z-[200] shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-[slideUp_.25s_ease] max-w-[92vw]">
          <span className="text-[12px] text-ok font-bold whitespace-nowrap">
            ✓ {participants.find((p) => p.id === lastRep.playerId)?.name} {skillByKey(lastRep.skill).k}{' '}
            {qualityByValue(lastRep.quality).s}
          </span>
          <button
            onClick={() => undoLastRep(id)}
            className="px-3.5 py-1.5 bg-err text-white rounded-lg text-[12px] font-extrabold"
          >
            تراجع
          </button>
        </div>
      )}
    </div>
  )
}
