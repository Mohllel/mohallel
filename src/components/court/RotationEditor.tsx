import { COURT_POSITIONS } from '../../constants/courtPositions'
import type { Player, RotationSlot } from '../../types/domain'

interface RotationEditorProps {
  title: string
  rotation: RotationSlot[]
  players: Player[]
  onAssign: (position: number, playerId: string | null) => void
  onRotate: () => void
  onClose: () => void
}

export function RotationEditor({ title, rotation, players, onAssign, onRotate, onClose }: RotationEditorProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[720px] bg-s1 border-t border-bd rounded-t-3xl p-4 pb-6 animate-[slideUp_.25s_ease] max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 text-[15px] font-extrabold">تشكيلة {title}</div>
          <button onClick={onRotate} className="px-3 py-1.5 bg-s2 border border-bd rounded-lg text-[12px] font-bold text-t2">
            ⟳ تدوير
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-s2 border border-bd text-t2 flex items-center justify-center">
            ✕
          </button>
        </div>

        {COURT_POSITIONS.slice()
          .sort((a, b) => a.position - b.position)
          .map((cp) => {
            const slot = rotation.find((r) => r.position === cp.position)
            return (
              <div key={cp.position} className="flex items-center gap-2 mb-2">
                <span className="w-16 text-[11px] text-t3 font-bold shrink-0">
                  {cp.position} · {cp.label}
                </span>
                <select
                  value={slot?.playerId ?? ''}
                  onChange={(e) => onAssign(cp.position, e.target.value || null)}
                  className="flex-1 bg-bg border border-bd rounded-lg px-2 py-2 text-[13px]"
                >
                  <option value="">— فارغ —</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.number != null ? ` (#${p.number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
      </div>
    </div>
  )
}
