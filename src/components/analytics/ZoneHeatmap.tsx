interface ZoneHeatmapProps {
  counts: number[]
  color: string
}

/** شبكة ٢×٣ (نفس تخطيط CourtZoneOverlay) تلوَّن كل منطقة بشدّة نسبية لعدد النقاط فيها */
export function ZoneHeatmap({ counts, color }: ZoneHeatmapProps) {
  const max = Math.max(1, ...counts)
  const total = counts.reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-3 gap-0.5 aspect-[2/3] w-full max-w-[140px] mx-auto bg-bg border border-bd overflow-hidden">
        {counts.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-[12px] font-extrabold text-white"
            style={{ backgroundColor: color, opacity: total === 0 ? 0.06 : 0.15 + (c / max) * 0.75 }}
          >
            {c > 0 ? c : ''}
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-t3 mt-1">{total} نقطة</p>
    </div>
  )
}
