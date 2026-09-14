import type { Player } from '../../types/domain'

interface PlayerCircleProps {
  x: number
  y: number
  player: Player | null
  variant?: 'own' | 'opponent'
  /** يُستدعى عند النقر على دائرة مشغولة (لاستهداف تبديل مثلاً) */
  onClick?: () => void
  /** يُستدعى عند النقر على خانة فارغة (فتح التشكيلة) */
  onEmptyClick?: () => void
  highlighted?: boolean
}

export function PlayerCircle({ x, y, player, variant = 'own', onClick, onEmptyClick, highlighted }: PlayerCircleProps) {
  const filledClass =
    variant === 'own'
      ? 'bg-gradient-to-br from-pri to-[#0284c7] text-white border-2 border-white/30'
      : 'bg-gradient-to-br from-err to-[#b91c1c] text-white border-2 border-white/30'

  return (
    <button
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={(e) => {
        e.stopPropagation()
        if (player) onClick?.()
        else onEmptyClick?.()
      }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex flex-col items-center justify-center font-black shadow-lg text-sm z-10 ${
        player ? filledClass : 'bg-s1 border-2 border-dashed border-bl text-t3 text-lg'
      } ${highlighted ? 'ring-4 ring-warn' : ''}`}
    >
      {player ? <span className="text-[13px] leading-none">{player.number ?? '—'}</span> : '+'}
    </button>
  )
}
