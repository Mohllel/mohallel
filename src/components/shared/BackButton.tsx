import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  /** وجهة ثابتة بدل الرجوع لسجل التصفح الافتراضي (navigate(-1)) */
  to?: string
  className?: string
}

export function BackButton({ to, className = '' }: BackButtonProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`w-[34px] h-[34px] rounded-[10px] bg-s2 border border-bd text-t2 flex items-center justify-center shrink-0 ${className}`}
      aria-label="رجوع"
    >
      ←
    </button>
  )
}
