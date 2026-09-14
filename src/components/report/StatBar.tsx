interface StatBarProps {
  label: string
  value: number
  max: number
  color: string
}

export function StatBar({ label, value, max, color }: StatBarProps) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-[9px] text-t2 w-[46px] text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color }} />
      </div>
      <span className="text-[9px] text-t3 w-[18px] text-left">{value || ''}</span>
    </div>
  )
}
