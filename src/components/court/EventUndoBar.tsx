import { useMatchesStore } from '../../store/useMatchesStore'
import type { TeamSide } from '../../types/domain'

interface EventUndoBarProps {
  matchId: string
  ownName: string
  opponentName: string
}

export function EventUndoBar({ matchId, ownName, opponentName }: EventUndoBarProps) {
  const lastEvent = useMatchesStore((s) => s.lastEvent)
  const undoLastEvent = useMatchesStore((s) => s.undoLastEvent)
  useMatchesStore((s) => s._undoEventIds[matchId])

  const event = lastEvent(matchId)
  if (!event) return null

  const sideName = (side: TeamSide) => (side === 'A' ? ownName : opponentName)
  const label =
    event.type === 'point'
      ? `نقطة لـ${sideName(event.side)}`
      : event.type === 'timeout'
        ? `تايم آوت لـ${sideName(event.side)}`
        : event.type === 'challenge'
          ? `تحدي لـ${sideName(event.side)} (${event.challengeResult === 'won' ? 'نجح' : 'فشل'})`
          : 'تبديل لاعب'

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-s1 border border-bl rounded-2xl px-4 py-2.5 flex items-center gap-3 z-[200] shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-[slideUp_.25s_ease] max-w-[92vw]">
      <span className="text-[12px] text-ok font-bold whitespace-nowrap">✓ {label}</span>
      <button
        onClick={() => undoLastEvent(matchId)}
        className="px-3.5 py-1.5 bg-err text-white rounded-lg text-[12px] font-extrabold"
      >
        تراجع
      </button>
    </div>
  )
}
