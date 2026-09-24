import { useEffect, useState } from 'react'
import { SKILLS } from '../../constants/skills'
import type { Player, SkillKey } from '../../types/domain'

interface PointTagPromptProps {
  scoringName: string
  players: Player[]
  onTag: (playerId: string, skill: SkillKey) => void
  onDismiss: () => void
}

/**
 * بطاقة اختيارية تظهر بعد تسجيل نقطة من خريطة الملعب — النقطة مُسجَّلة بالفعل، هذه فقط
 * لإسناد المهارة/اللاعب لتحليل أدق، بخطوتين سريعتين (لاعب ثم مهارة)، وتُغلق تلقائياً إن أُهملت.
 */
export function PointTagPrompt({ scoringName, players, onTag, onDismiss }: PointTagPromptProps) {
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (players.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-s1 border border-bl rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-[92vw] w-80 animate-[slideUp_.25s_ease]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold text-t2">
          {playerId ? 'بأي مهارة؟' : `من سجّل نقطة ${scoringName}؟ (اختياري)`}
        </span>
        <button onClick={onDismiss} className="text-t3 text-xs">
          ✕
        </button>
      </div>

      {!playerId ? (
        <div className="flex flex-wrap gap-1.5">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlayerId(p.id)}
              className="px-2.5 py-1.5 bg-bg border border-bd rounded-lg text-[11px] font-bold"
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map((s) => (
            <button
              key={s.k}
              onClick={() => onTag(playerId, s.k)}
              style={{ borderColor: s.c, color: s.c }}
              className="px-2.5 py-1.5 bg-bg border-[1.5px] rounded-lg text-[11px] font-bold"
            >
              {s.l}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
