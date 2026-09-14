import type { ReactNode } from 'react'

interface IconButtonProps {
  children: ReactNode
  onClick?: () => void
  label?: string
}

export function IconButton({ children, onClick, label }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-[34px] h-[34px] rounded-[10px] bg-s2 border border-bd text-t2 text-[15px] flex items-center justify-center"
    >
      {children}
    </button>
  )
}
