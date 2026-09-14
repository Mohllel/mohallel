import { QUALITIES } from '../../constants/quality'
import { SKILLS } from '../../constants/skills'
import { skillQualityMatrix } from '../../lib/analytics'
import type { Action } from '../../types/domain'

interface SkillQualityHeatmapProps {
  actions: Action[]
  playerId: string
  size?: 'compact' | 'full'
}

/** خريطة حرارية: صفوف = المهارات التسع، أعمدة = التقييمات الأربعة — كل خلية بحرارة حسب عدد المرات */
export function SkillQualityHeatmap({ actions, playerId, size = 'full' }: SkillQualityHeatmapProps) {
  const matrix = skillQualityMatrix(actions, playerId)
  const max = Math.max(1, ...matrix.flat())
  const cell = size === 'full' ? 34 : 22
  const fontLabel = size === 'full' ? 10 : 8
  const fontValue = size === 'full' ? 12 : 9

  return (
    <div className="inline-block">
      <div className="flex" style={{ marginRight: size === 'full' ? 64 : 46 }}>
        {QUALITIES.slice()
          .reverse()
          .map((q) => (
            <div
              key={q.v}
              style={{ width: cell, fontSize: fontLabel }}
              className="text-center text-t3 font-bold shrink-0"
            >
              {q.s}
            </div>
          ))}
      </div>
      {SKILLS.map((s, ri) => (
        <div key={s.k} className="flex items-center">
          <div
            style={{ width: size === 'full' ? 60 : 44, fontSize: fontLabel }}
            className="text-right pl-1.5 font-bold shrink-0 truncate"
          >
            {s.l}
          </div>
          {QUALITIES.slice()
            .reverse()
            .map((q, ci) => {
              const count = matrix[ri][QUALITIES.length - 1 - ci]
              const intensity = count / max
              return (
                <div
                  key={q.v}
                  style={{
                    width: cell,
                    height: cell,
                    background: intensity > 0 ? s.c : 'var(--color-s2)',
                    opacity: intensity > 0 ? 0.25 + intensity * 0.75 : 1,
                    fontSize: fontValue,
                  }}
                  className="shrink-0 border border-bg flex items-center justify-center font-extrabold text-white"
                >
                  {count || ''}
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}
