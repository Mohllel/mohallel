import { useState } from 'react'
import { SKILLS } from '../../constants/skills'
import { QUALITIES } from '../../constants/quality'
import type { Player, Quality, SkillKey } from '../../types/domain'

interface PlayerRecordSheetProps {
  player: Player
  onRecord: (skill: SkillKey, quality: Quality) => void
  onClose: () => void
}

/** ورقة تسجيل تُفتح بالنقر على لاعب داخل الملعب — تختار مهارة ثم تقييماً، وتسجّل كتكرار كامل (مع احتساب النقطة تلقائياً إن استحقّت) */
export function PlayerRecordSheet({ player, onRecord, onClose }: PlayerRecordSheetProps) {
  const [skill, setSkill] = useState<SkillKey | null>(null)

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-s1 border-t border-bd rounded-t-3xl p-4 pb-6 animate-[slideUp_.25s_ease]"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="flex-1 text-[15px] font-extrabold">{player.name}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-s2 border border-bd text-t2 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {!skill ? (
          <div className="grid grid-cols-3 gap-2">
            {SKILLS.map((s) => (
              <button
                key={s.k}
                onClick={() => setSkill(s.k)}
                style={{ borderColor: s.c, color: s.c }}
                className="py-3.5 rounded-xl border-[1.5px] bg-bg text-[12px] font-bold"
              >
                {s.l}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSkill(null)} className="text-[11px] text-t3 font-bold mb-3">
              ← رجوع لاختيار المهارة
            </button>
            <div className="grid grid-cols-4 gap-2">
              {QUALITIES.map((q) => (
                <button
                  key={q.v}
                  onClick={() => onRecord(skill, q.v)}
                  style={{ background: q.c }}
                  className="py-4 rounded-xl text-white font-black flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{q.s}</span>
                  <span className="text-[10px]">{q.l}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
