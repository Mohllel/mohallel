import { useState } from 'react'
import { skillByKey } from '../../../constants/skills'
import { qualityByValue } from '../../../constants/quality'
import { getVideoOffsetSeconds, formatSeconds } from '../../../lib/video'
import type { Action, Match, Player } from '../../../types/domain'

interface ActionTimelineProps {
  match: Match
  players: Player[]
  onPlay: (offsetSeconds: number) => void
  onCalibrate: (referenceTs: number, videoSeconds: number) => void
}

export function ActionTimeline({ match, players, onPlay, onCalibrate }: ActionTimelineProps) {
  const [calibratingId, setCalibratingId] = useState<string | null>(null)
  const [secondsInput, setSecondsInput] = useState('')

  const sorted = [...match.act].sort((a, b) => a.ts - b.ts)
  const calibrated = match.videoStartedAt != null

  const submitCalibration = (action: Action) => {
    const seconds = Number(secondsInput)
    if (!Number.isFinite(seconds) || seconds < 0) return
    onCalibrate(action.ts, seconds)
    setCalibratingId(null)
    setSecondsInput('')
  }

  if (sorted.length === 0) {
    return <p className="text-center text-t3 text-[12px] py-6">لا توجد إجراءات مسجَّلة بعد.</p>
  }

  return (
    <div className="bg-s1 border border-bd rounded-2xl overflow-hidden">
      {sorted.map((a) => {
        const player = players.find((p) => p.id === a.playerId)
        const skill = skillByKey(a.skill)
        const quality = qualityByValue(a.quality)
        const offset = getVideoOffsetSeconds(match, a.ts)

        return (
          <div key={a.id} className="border-b border-bd last:border-b-0">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="text-[9px] text-t3 w-8 shrink-0">ش{a.set}</span>
              <span className="flex-1 text-[12px] font-bold truncate">{player?.name ?? '—'}</span>
              <span className="text-[11px] font-extrabold shrink-0" style={{ color: skill.c }}>
                {skill.l}
              </span>
              <span className="text-[11px] font-bold shrink-0" style={{ color: quality.c }}>
                {quality.s}
              </span>

              {offset != null && match.videoUrl && (
                <button
                  onClick={() => onPlay(offset)}
                  className="w-8 h-8 rounded-full bg-pri text-white flex items-center justify-center shrink-0"
                  title={formatSeconds(offset)}
                >
                  ▶
                </button>
              )}

              {match.videoUrl && (
                <button
                  onClick={() => setCalibratingId(calibratingId === a.id ? null : a.id)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-[13px] ${
                    calibratingId === a.id ? 'bg-sec border-sec text-white' : 'bg-s2 border-bd text-t3'
                  }`}
                  title="اضبط هذا الإجراء كنقطة مرجعية بالفيديو"
                >
                  ⚓
                </button>
              )}
            </div>

            {calibratingId === a.id && (
              <div className="flex items-center gap-2 px-3 pb-3">
                <span className="text-[11px] text-t2 flex-1">
                  عند أي ثانية بالفيديو حدث هذا الإجراء بالضبط؟
                </span>
                <input
                  type="number"
                  value={secondsInput}
                  onChange={(e) => setSecondsInput(e.target.value)}
                  placeholder="مثال: 125"
                  className="w-24 text-center"
                />
                <button
                  onClick={() => submitCalibration(a)}
                  className="px-3 py-2 bg-ok text-white rounded-lg text-[11px] font-extrabold"
                >
                  ضبط
                </button>
              </div>
            )}
          </div>
        )
      })}
      {!calibrated && (
        <p className="text-[10px] text-t3 p-3 border-t border-bd">
          اضبط أي إجراء (⚓) كنقطة مرجعية أولاً — بذكر ثانية حدوثه الحقيقية بالفيديو — لتفعيل أزرار ▶ على كل الإجراءات.
        </p>
      )}
    </div>
  )
}
