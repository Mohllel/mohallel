import { useEffect, useRef, useState } from 'react'

/** يُحرّك رقماً من 0 إلى القيمة الهدف عبر requestAnimationFrame — لعرض إحصائيات بأنيميشن عند ظهورها */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    let frame: number
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
