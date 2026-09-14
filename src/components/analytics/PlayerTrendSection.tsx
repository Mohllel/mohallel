import { useMemo, useState } from 'react'
import { computePlayerTrend } from '../../lib/playerTrend'
import type { Match, Player } from '../../types/domain'
import { LineChart } from './LineChart'

interface PlayerTrendSectionProps {
  players: Player[]
  matches: Match[]
}

type Metric = 'average' | 'points' | 'errors'

const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: 'average', label: 'متوسط التقييم', color: 'var(--color-pri)' },
  { key: 'points', label: 'النقاط', color: 'var(--color-ok)' },
  { key: 'errors', label: 'الأخطاء', color: 'var(--color-err)' },
]

export function PlayerTrendSection({ players, matches }: PlayerTrendSectionProps) {
  const playersWithData = useMemo(
    () => players.filter((p) => computePlayerTrend(matches, p.id).length > 0),
    [players, matches],
  )
  const [playerId, setPlayerId] = useState<string>(playersWithData[0]?.id ?? '')
  const [metric, setMetric] = useState<Metric>('average')

  const trend = playerId ? computePlayerTrend(matches, playerId) : []
  const activeMetric = METRICS.find((m) => m.key === metric)!

  const chartPoints = trend.map((t) => ({
    label: t.date.slice(5),
    value: metric === 'average' ? t.average : metric === 'points' ? t.points : t.errors,
  }))
  const maxValue = metric === 'average' ? 3 : Math.max(1, ...chartPoints.map((p) => p.value))

  const first = trend[0]
  const last = trend[trend.length - 1]
  const trendDelta =
    first && last && trend.length > 1
      ? (metric === 'average' ? last.average - first.average : metric === 'points' ? last.points - first.points : last.errors - first.errors)
      : null

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-2">📈 تطور اللاعب عبر الزمن</div>

      {playersWithData.length === 0 ? (
        <p className="text-[12px] text-t3">لا توجد بيانات كافية بعد — سجّل مباراتين على الأقل لنفس اللاعب.</p>
      ) : (
        <>
          <div className="flex gap-1.5 mb-3">
            <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="flex-1">
              {playersWithData.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5 mb-3">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold border ${
                  metric === m.key ? 'text-white' : 'bg-s2 border-bd text-t3'
                }`}
                style={metric === m.key ? { background: m.color, borderColor: m.color } : undefined}
              >
                {m.label}
              </button>
            ))}
          </div>

          {trend.length < 2 ? (
            <p className="text-[12px] text-t3">
              يحتاج هذا اللاعب مباراة واحدة إضافية على الأقل ليظهر خط تطوّر (متوفر حالياً مباراة واحدة فقط).
            </p>
          ) : (
            <>
              <LineChart points={chartPoints} color={activeMetric.color} min={0} max={maxValue} />
              {trendDelta != null && (
                <p className="text-[11px] text-t2 mt-2">
                  من أول مباراة لآخر مباراة:{' '}
                  <span className={`font-extrabold ${trendDelta > 0 ? (metric === 'errors' ? 'text-err' : 'text-ok') : trendDelta < 0 ? (metric === 'errors' ? 'text-ok' : 'text-err') : 'text-t3'}`}>
                    {trendDelta > 0 ? `+${trendDelta.toFixed(1)} ▲` : trendDelta < 0 ? `${trendDelta.toFixed(1)} ▼` : 'بلا تغيّر'}
                  </span>
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
