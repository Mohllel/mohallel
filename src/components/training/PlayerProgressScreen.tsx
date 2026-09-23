import { useMemo, useState } from 'react'
import { useClubStore } from '../../store/useClubStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { SKILLS, skillByKey } from '../../constants/skills'
import type { SkillKey } from '../../types/domain'
import { BackButton } from '../shared/BackButton'

interface ProgressPoint {
  date: string
  avg: number
  count: number
}

export function PlayerProgressScreen() {
  const { players } = useClubStore()
  const sessions = useTrainingStore((s) => s.sessions)
  const matches = useMatchesStore((s) => s.matches)

  const [playerId, setPlayerId] = useState(players[0]?.id ?? '')
  const [skill, setSkill] = useState<SkillKey>('S')

  const player = players.find((p) => p.id === playerId)

  const trainingPoints: ProgressPoint[] = useMemo(() => {
    if (!playerId) return []
    return Object.values(sessions)
      .filter((s) => s.status !== 'scheduled')
      .map((s) => {
        const reps = s.reps.filter((r) => r.playerId === playerId && r.skill === skill)
        if (reps.length === 0) return null
        const avg = reps.reduce((sum, r) => sum + r.quality, 0) / reps.length
        return { date: s.date, avg, count: reps.length }
      })
      .filter((p): p is ProgressPoint => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [sessions, playerId, skill])

  const trainingOverallAvg = useMemo(() => {
    if (trainingPoints.length === 0) return null
    const totalReps = trainingPoints.reduce((sum, p) => sum + p.count, 0)
    const totalQuality = trainingPoints.reduce((sum, p) => sum + p.avg * p.count, 0)
    return totalReps ? totalQuality / totalReps : null
  }, [trainingPoints])

  const matchOverallAvg = useMemo(() => {
    if (!playerId) return null
    const acts = Object.values(matches)
      .flatMap((m) => m.act)
      .filter((a) => a.playerId === playerId && a.skill === skill)
    if (acts.length === 0) return null
    return acts.reduce((sum, a) => sum + a.quality, 0) / acts.length
  }, [matches, playerId, skill])

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <BackButton to="/training" />
        <h2 className="text-[18px] font-black flex-1">📈 تقدّم الأداء</h2>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <label className="block text-[11px] text-t2 mb-1 font-bold">اللاعب</label>
        <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="mb-3">
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="block text-[11px] text-t2 mb-1 font-bold">المهارة</label>
        <select value={skill} onChange={(e) => setSkill(e.target.value as SkillKey)}>
          {SKILLS.map((s) => (
            <option key={s.k} value={s.k}>
              {s.l}
            </option>
          ))}
        </select>
      </div>

      {!player ? (
        <p className="text-center text-t3 text-[13px] mt-6">أضف لاعبين من الإعدادات أولاً.</p>
      ) : (
        <>
          <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
            <div className="text-[13px] font-extrabold mb-3">
              مسار {player.name} — {skillByKey(skill).l} عبر التمارين
            </div>
            {trainingPoints.length < 2 ? (
              <p className="text-[12px] text-t3 text-center py-6">
                يحتاج تمرينان مسجَّلان على الأقل بهذه المهارة لعرض المسار.
              </p>
            ) : (
              <ProgressChart points={trainingPoints} />
            )}
          </div>

          <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
            <div className="text-[13px] font-extrabold mb-3">التدريب مقابل المباراة</div>
            <div className="flex gap-3">
              <CompareTile label="متوسط التدريب" value={trainingOverallAvg} colorVar="--color-pri" />
              <CompareTile label="متوسط المباراة" value={matchOverallAvg} colorVar="--color-sec" />
            </div>
            {trainingOverallAvg != null && matchOverallAvg != null && (
              <p className="text-[11px] text-t3 mt-3 text-center">
                {matchOverallAvg >= trainingOverallAvg
                  ? '✅ أداؤه بالمباراة يضاهي أو يتفوّق على التدريب'
                  : '⚠ أداؤه بالتدريب أفضل من المباراة — قد يحتاج مزيداً من الثقة تحت الضغط'}
              </p>
            )}
            {(trainingOverallAvg == null || matchOverallAvg == null) && (
              <p className="text-[11px] text-t3 mt-3 text-center">
                تحتاج بيانات تدريب ومباريات لهذه المهارة معاً لعرض المقارنة.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CompareTile({ label, value, colorVar }: { label: string; value: number | null; colorVar: string }) {
  return (
    <div className="flex-1 bg-bg border border-bd rounded-xl py-3 text-center">
      <div className="text-[20px] font-black" style={{ color: `var(${colorVar})` }}>
        {value != null ? value.toFixed(2) : '—'}
      </div>
      <div className="text-[10px] text-t3 font-bold mt-0.5">{label}</div>
    </div>
  )
}

function ProgressChart({ points }: { points: ProgressPoint[] }) {
  const W = 600
  const H = 160
  const padX = 16
  const padY = 18
  const maxY = 3
  const stepX = points.length > 1 ? (W - padX * 2) / (points.length - 1) : 0
  const coords = points.map((p, i) => ({
    x: padX + i * stepX,
    y: H - padY - (p.avg / maxY) * (H - padY * 2),
    ...p,
  }))
  const linePath = coords.map((c) => `${c.x},${c.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <polyline points={linePath} fill="none" style={{ stroke: 'var(--color-pri)' }} strokeWidth="2.5" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="4" style={{ fill: 'var(--color-pri)' }} />
          <text x={c.x} y={H - 2} fontSize="9" textAnchor="middle" style={{ fill: 'var(--color-t3)' }}>
            {c.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  )
}
