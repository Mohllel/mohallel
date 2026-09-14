import { useMatchesStore } from '../../store/useMatchesStore'
import type { LiveMode } from '../../types/domain'

const MODES: { v: LiveMode; l: string }[] = [
  { v: 'grid', l: '🎯 دقيق' },
  { v: 'quick', l: '⚡ سريع' },
  { v: 'court', l: '🏐 خريطة الملعب' },
]

interface ModeToggleProps {
  matchId: string
}

export function ModeToggle({ matchId }: ModeToggleProps) {
  const mode = useMatchesStore((s) => s.matches[matchId]?.mode)
  const setMode = useMatchesStore((s) => s.setMode)

  return (
    <div className="flex gap-1 px-3 pt-2 pb-1">
      {MODES.map((m) => (
        <button
          key={m.v}
          onClick={() => setMode(matchId, m.v)}
          className={`flex-1 py-2 rounded-[10px] text-[11px] font-extrabold text-center transition-all ${
            mode === m.v
              ? 'bg-pri text-white border border-pri shadow-[0_2px_12px_var(--color-pri-glow)]'
              : 'bg-s1 text-t3 border border-bd'
          }`}
        >
          {m.l}
        </button>
      ))}
    </div>
  )
}
