interface CourtZoneOverlayProps {
  onZoneTap: (zone: number) => void
}

/**
 * شبكة 6 مناطق (عمودان × 3 صفوف) تغطي نصف الملعب بالكامل لتسجيل نقطة بمكان
 * سقوط الكرة بنقرة واحدة — بلا اختيار مهارة. تُرسم خلف دوائر اللاعبين.
 */
export function CourtZoneOverlay({ onZoneTap }: CourtZoneOverlayProps) {
  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 z-0">
      {[1, 2, 3, 4, 5, 6].map((zone) => (
        <button
          key={zone}
          onClick={() => onZoneTap(zone)}
          className="relative border border-white/[0.03] active:bg-white/5 flex items-start justify-end p-1"
        >
          <span className="text-[9px] text-white/10 font-bold">{zone}</span>
        </button>
      ))}
    </div>
  )
}
