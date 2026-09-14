import type { Player } from '../../types/domain'
import { Avatar } from '../shared/Avatar'
import { useRef } from 'react'

interface PlayerChipProps {
  player: Player
  onRemove: () => void
  onPhoto: (dataUrl: string) => void
  onNumberChange: (number: number | undefined) => void
}

export function PlayerChip({ player, onRemove, onPhoto, onNumberChange }: PlayerChipProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2 bg-bg border border-bd rounded-xl px-2.5 py-2 mb-1.5">
      <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
        <Avatar name={player.name} photo={player.photo} />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
              if (typeof ev.target?.result === 'string') onPhoto(ev.target.result)
            }
            reader.readAsDataURL(file)
          }}
        />
      </div>
      <span className="flex-1 text-[13px] font-bold">{player.name}</span>
      <span className="flex items-center gap-0.5 text-[11px] text-t3 font-bold">
        #
        <input
          type="number"
          value={player.number ?? ''}
          onChange={(e) => onNumberChange(e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder="0"
          className="w-10 text-center px-1 py-1 text-[12px]"
        />
      </span>
      <button
        onClick={onRemove}
        className="w-6 h-6 rounded-full bg-err/10 text-err text-xs flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  )
}
