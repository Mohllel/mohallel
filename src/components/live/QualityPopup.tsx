import { useEffect, useRef } from 'react'
import { QUALITIES } from '../../constants/quality'
import type { Quality } from '../../types/domain'

interface QualityPopupProps {
  anchorRect: DOMRect
  onPick: (q: Quality) => void
  onClose: () => void
}

export function QualityPopup({ anchorRect, onPick, onClose }: QualityPopupProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const id = setTimeout(() => document.addEventListener('click', handler), 50)
    return () => {
      clearTimeout(id)
      document.removeEventListener('click', handler)
    }
  }, [onClose])

  const top = anchorRect.bottom + 4
  const left = Math.max(8, Math.min(anchorRect.left + anchorRect.width / 2 - 120, window.innerWidth - 248))

  return (
    <div
      ref={ref}
      style={{ top, left }}
      className="fixed z-[100] bg-s1 border-[1.5px] border-bl rounded-2xl p-1.5 flex gap-1 shadow-[0_8px_30px_rgba(0,0,0,0.6)] animate-[popIn_.15s_ease]"
    >
      {QUALITIES.map((q) => (
        <button
          key={q.v}
          onClick={() => onPick(q.v)}
          style={{ background: q.c }}
          className="w-[52px] h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-white"
        >
          <span className="text-lg font-black">{q.s}</span>
          <span className="text-[9px] font-bold">{q.l}</span>
        </button>
      ))}
    </div>
  )
}
