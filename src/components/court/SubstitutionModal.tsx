import { useState } from 'react'
import type { Player, RotationSlot, TeamSide } from '../../types/domain'

interface SubstitutionModalProps {
  side: TeamSide
  ownName: string
  opponentName: string
  rotation: RotationSlot[]
  players: Player[]
  benchPlayers: Player[]
  onSubstitute: (position: number, incomingPlayerId: string) => void
  onSwitchSide?: () => void
  onClose: () => void
}

export function SubstitutionModal({
  side,
  ownName,
  opponentName,
  rotation,
  players,
  benchPlayers,
  onSubstitute,
  onSwitchSide,
  onClose,
}: SubstitutionModalProps) {
  const [outPosition, setOutPosition] = useState<number | ''>('')
  const [inPlayerId, setInPlayerId] = useState('')

  const playerName = (id: string | null) => (id ? players.find((p) => p.id === id)?.name ?? '—' : '—')

  const confirm = () => {
    if (outPosition === '' || !inPlayerId) return
    onSubstitute(Number(outPosition), inPlayerId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-s1 border border-bd rounded-2xl p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-extrabold">🔁 تبديل — {side === 'A' ? ownName : opponentName}</span>
          {onSwitchSide && (
            <button onClick={onSwitchSide} className="text-[11px] font-bold text-pri">
              تبديل الفريق
            </button>
          )}
        </div>

        <label className="block text-[11px] text-t2 mb-1 font-bold">من يخرج (بالملعب)</label>
        <select value={outPosition} onChange={(e) => setOutPosition(e.target.value === '' ? '' : Number(e.target.value))} className="mb-3">
          <option value="">— اختر —</option>
          {rotation.map((slot) => (
            <option key={slot.position} value={slot.position} disabled={!slot.playerId}>
              موقع {slot.position} · {slot.playerId ? playerName(slot.playerId) : 'فارغ'}
            </option>
          ))}
        </select>

        <label className="block text-[11px] text-t2 mb-1 font-bold">من يدخل (احتياط)</label>
        <select value={inPlayerId} onChange={(e) => setInPlayerId(e.target.value)} className="mb-4">
          <option value="">— اختر —</option>
          {benchPlayers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.number != null ? ` (#${p.number})` : ''}
            </option>
          ))}
        </select>

        <button
          onClick={confirm}
          disabled={outPosition === '' || !inPlayerId}
          className="w-full py-3 bg-ok text-white rounded-xl font-extrabold text-[13px] disabled:opacity-40"
        >
          تأكيد التبديل
        </button>
      </div>
    </div>
  )
}
