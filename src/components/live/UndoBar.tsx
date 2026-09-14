import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import { skillByKey } from '../../constants/skills'
import { qualityByValue } from '../../constants/quality'

interface UndoBarProps {
  matchId: string
}

export function UndoBar({ matchId }: UndoBarProps) {
  const players = useMatchPlayers(matchId)
  const lastAction = useMatchesStore((s) => s.lastAction)
  const undoLastAction = useMatchesStore((s) => s.undoLastAction)
  // subscribe so the bar re-renders when the undo id changes
  useMatchesStore((s) => s._undoIds[matchId])

  const action = lastAction(matchId)
  if (!action) return null

  const player = players.find((p) => p.id === action.playerId)
  const skill = skillByKey(action.skill)
  const quality = qualityByValue(action.quality)

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-s1 border border-bl rounded-2xl px-4 py-2.5 flex items-center gap-3 z-[200] shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-[slideUp_.25s_ease] max-w-[92vw]">
      <span className="text-[12px] text-ok font-bold whitespace-nowrap">
        ✓ {player?.name} {skill.k} {quality.s}
      </span>
      <button
        onClick={() => undoLastAction(matchId)}
        className="px-3.5 py-1.5 bg-err text-white rounded-lg text-[12px] font-extrabold"
      >
        تراجع
      </button>
    </div>
  )
}
