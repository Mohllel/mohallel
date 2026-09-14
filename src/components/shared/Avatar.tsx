import { initials } from '../../lib/stats'

interface AvatarProps {
  name: string
  photo?: string | null
  size?: number
  onClick?: () => void
}

export function Avatar({ name, photo, size = 32, onClick }: AvatarProps) {
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className="shrink-0 overflow-hidden rounded-full border-[1.5px] border-bl bg-s2 flex items-center justify-center text-pri font-extrabold text-[11px]"
    >
      {photo ? (
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  )
}
