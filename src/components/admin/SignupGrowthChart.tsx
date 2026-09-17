import type { SignupGrowthPoint } from '../../lib/adminApi'

export function SignupGrowthChart({ points }: { points: SignupGrowthPoint[] }) {
  if (points.length === 0) return null
  const max = Math.max(1, ...points.map((p) => p.count))

  return (
    <div className="bg-s1 border border-bd p-4 mb-4">
      <div className="text-[14px] font-extrabold mb-3">📈 نمو التسجيلات</div>
      <div className="flex items-end gap-2 h-28">
        {points.map((p) => (
          <div key={p.monthKey} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] font-extrabold text-pri mb-1">{p.count}</span>
            <div
              className="w-full bg-pri"
              style={{ height: `${Math.max(4, (p.count / max) * 100)}%` }}
            />
            <span className="text-[9px] text-t3 mt-1 whitespace-nowrap">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
