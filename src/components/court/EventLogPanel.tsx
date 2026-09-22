import type { MatchEvent, Player, TeamSide } from '../../types/domain'
import { describeMatchEvent, MATCH_EVENT_ICON } from '../../lib/matchEventDescription'

interface EventLogPanelProps {
  events: MatchEvent[]
  ownName: string
  opponentName: string
  findPlayer: (side: TeamSide, playerId: string | undefined) => Player | undefined
}

/** سجل أحداث ثابت يبقى ظاهراً باستمرار على جانب الشاشة أثناء المباراة (بدل نافذة منبثقة تُفتح يدوياً) */
export function EventLogPanel({ events, ownName, opponentName, findPlayer }: EventLogPanelProps) {
  const sorted = [...events].sort((a, b) => b.ts - a.ts)

  return (
    <div className="w-[92px] shrink-0 sticky top-2 max-h-[70vh] overflow-y-auto bg-s1 border border-bd rounded-xl p-1.5">
      <div className="text-[10px] font-extrabold text-t2 text-center mb-1.5 sticky top-0 bg-s1">📜 السجل</div>
      {sorted.length === 0 ? (
        <p className="text-center text-t3 text-[9px] py-3 leading-tight">لا أحداث بعد</p>
      ) : (
        sorted.map((e) => (
          <div key={e.id} className="py-1 border-b border-bd last:border-b-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] shrink-0">{MATCH_EVENT_ICON[e.type]}</span>
              <span className="text-[8px] text-t3">ش{e.set}</span>
            </div>
            <div className="text-[9px] font-bold leading-tight">
              {describeMatchEvent(e, ownName, opponentName, findPlayer)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
