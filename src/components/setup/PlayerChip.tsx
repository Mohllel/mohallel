import type { Player, PlayerPosition } from '../../types/domain'
import { Avatar } from '../shared/Avatar'
import { useRef, useState } from 'react'
import { useClubStore } from '../../store/useClubStore'
import { enhancePlayerPhoto } from '../../lib/aiPhoto'
import { isCloudEnabled } from '../../lib/supabase'
import { uploadImage } from '../../lib/storage'
import { PLAYER_POSITIONS, PLAYER_POSITION_LABELS } from '../../lib/playerPositions'

interface PlayerChipProps {
  player: Player
  onRemove: () => void
  onPhoto: (dataUrl: string) => void
  onNumberChange: (number: number | undefined) => void
  onPositionChange: (position: PlayerPosition | undefined) => void
  onBioChange: (bio: string) => void
}

export function PlayerChip({
  player,
  onRemove,
  onPhoto,
  onNumberChange,
  onPositionChange,
  onBioChange,
}: PlayerChipProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const jerseyPhoto = useClubStore((s) => s.jerseyPhoto)
  const [enhancing, setEnhancing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bioOpen, setBioOpen] = useState(false)

  const handleEnhance = async () => {
    if (!player.photo || !jerseyPhoto || enhancing) return
    setEnhancing(true)
    try {
      const result = await enhancePlayerPhoto(player.photo, jerseyPhoto)
      const url = await uploadImage(`players/${player.id}`, result)
      onPhoto(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل توليد الصورة')
    } finally {
      setEnhancing(false)
    }
  }

  const handleUpload = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      if (typeof ev.target?.result !== 'string') return
      setUploading(true)
      try {
        const url = await uploadImage(`players/${player.id}`, ev.target.result)
        onPhoto(url)
      } catch (e) {
        alert(e instanceof Error ? e.message : 'فشل رفع الصورة')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative flex flex-col items-center bg-bg border border-bd rounded-xl px-2 pt-4 pb-2.5">
      <button
        onClick={onRemove}
        className="absolute top-1.5 left-1.5 w-5 h-5 rounded bg-err/10 text-err text-[10px] flex items-center justify-center"
      >
        ✕
      </button>

      <div onClick={() => inputRef.current?.click()} className="cursor-pointer relative">
        <Avatar name={player.name} photo={player.photo} size={64} />
        {(enhancing || uploading) && (
          <div className="absolute inset-0 rounded-full bg-bg/70 flex items-center justify-center text-[10px] animate-pulse">
            {enhancing ? '✨' : '...'}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
      </div>

      <span className="mt-2 text-[12px] font-bold text-center leading-tight line-clamp-2">{player.name}</span>

      <span className="flex items-center gap-0.5 text-[11px] text-t3 font-bold mt-1.5">
        #
        <input
          type="number"
          value={player.number ?? ''}
          onChange={(e) => onNumberChange(e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder="0"
          className="w-10 text-center px-1 py-1 text-[12px]"
        />
      </span>

      <select
        value={player.position ?? ''}
        onChange={(e) => onPositionChange(e.target.value ? (e.target.value as PlayerPosition) : undefined)}
        className="mt-1.5 w-full bg-s1 border border-bd rounded-md text-[10px] text-center py-1"
      >
        <option value="">المركز؟</option>
        {PLAYER_POSITIONS.map((pos) => (
          <option key={pos} value={pos}>
            {PLAYER_POSITION_LABELS[pos]}
          </option>
        ))}
      </select>

      {isCloudEnabled && player.photo && jerseyPhoto && (
        <button
          onClick={handleEnhance}
          disabled={enhancing}
          className="mt-1.5 text-[10px] font-bold text-pri disabled:opacity-40"
        >
          {enhancing ? 'جارٍ التحسين...' : '✨ تحسين بالذكاء الاصطناعي'}
        </button>
      )}

      <button onClick={() => setBioOpen((v) => !v)} className="mt-1.5 text-[10px] font-bold text-t2">
        {bioOpen ? 'إخفاء النبذة ▲' : '📝 نبذة اللاعب ▾'}
      </button>
      {bioOpen && (
        <textarea
          value={player.bio ?? ''}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="نبذة قصيرة عن اللاعب..."
          rows={2}
          className="mt-1.5 w-full bg-s1 border border-bd rounded-md p-1.5 text-[10px] resize-none"
        />
      )}
    </div>
  )
}
