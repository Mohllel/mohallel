import type { MatchEvent, Player, TeamSide } from '../../types/domain'

interface EventLogSheetProps {
  events: MatchEvent[]
  ownName: string
  opponentName: string
  findPlayer: (side: TeamSide, playerId: string | undefined) => Player | undefined
  onClose: () => void
}

const TYPE_ICON: Record<MatchEvent['type'], string> = {
  point: '🏐',
  timeout: '⏱',
  challenge: '🖥',
  substitution: '🔄',
}

export function EventLogSheet({ events, ownName, opponentName, findPlayer, onClose }: EventLogSheetProps) {
  const sideName = (side: TeamSide) => (side === 'A' ? ownName : opponentName)
  const sorted = [...events].sort((a, b) => b.ts - a.ts)

  const describe = (e: MatchEvent): string => {
    switch (e.type) {
      case 'point':
        return `نقطة لـ${sideName(e.side)}${e.zone ? ` — منطقة ${e.zone}` : ''}`
      case 'timeout':
        return `تايم آوت لـ${sideName(e.side)}`
      case 'challenge':
        return `تحدي (VAR) لـ${sideName(e.side)} — ${e.challengeResult === 'won' ? 'نجح ✅' : 'فشل ❌'}`
      case 'substitution': {
        const out = findPlayer(e.side, e.subOutPlayerId)
        const inP = findPlayer(e.side, e.subInPlayerId)
        return `تبديل ${sideName(e.side)}: خرج #${out?.number ?? '—'} دخل #${inP?.number ?? '—'}`
      }
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[720px] bg-s1 border-t border-bd rounded-t-3xl p-4 pb-6 animate-[slideUp_.25s_ease] max-h-[75vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 text-[15px] font-extrabold">📜 سجل الأحداث</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-s2 border border-bd text-t2 flex items-center justify-center">
            ✕
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-t3 text-[12px] py-6">لا توجد أحداث بعد.</p>
        ) : (
          sorted.map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 py-2 border-b border-bd last:border-b-0">
              <span className="text-lg shrink-0">{TYPE_ICON[e.type]}</span>
              <span className="flex-1 text-[12px] font-bold">{describe(e)}</span>
              <span className="text-[10px] text-t3 shrink-0">ش{e.set}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
