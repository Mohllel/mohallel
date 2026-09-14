interface LineChartPoint {
  label: string
  value: number
}

interface LineChartProps {
  points: LineChartPoint[]
  color?: string
  min?: number
  max?: number
  height?: number
  /** خطوط مرجعية أفقية (مثلاً متوسط 1.5) */
  referenceLine?: number
}

const PADDING_X = 24
const PADDING_TOP = 16
const PADDING_BOTTOM = 28

/** رسم خطي بسيط بلا مكتبة خارجية — يعرض تطور قيمة عبر نقاط متتالية (اتجاه زمني LTR ثابت) */
export function LineChart({ points, color = 'var(--color-pri)', min = 0, max = 3, height = 160 }: LineChartProps) {
  if (points.length === 0) return null

  const width = Math.max(280, points.length * 60)
  const plotW = width - PADDING_X * 2
  const plotH = height - PADDING_TOP - PADDING_BOTTOM
  const range = max - min || 1

  const xAt = (i: number) => (points.length === 1 ? width / 2 : PADDING_X + (i / (points.length - 1)) * plotW)
  const yAt = (v: number) => PADDING_TOP + plotH - ((v - min) / range) * plotH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.value)}`).join(' ')

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        {[min, (min + max) / 2, max].map((gridV) => (
          <line
            key={gridV}
            x1={PADDING_X}
            x2={width - PADDING_X}
            y1={yAt(gridV)}
            y2={yAt(gridV)}
            stroke="var(--color-bd)"
            strokeWidth={1}
          />
        ))}

        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={xAt(i)} cy={yAt(p.value)} r={4} fill={color} stroke="var(--color-bg)" strokeWidth={1.5} />
            <text x={xAt(i)} y={yAt(p.value) - 10} textAnchor="middle" fontSize={10} fontWeight={800} fill="var(--color-t1)">
              {p.value.toFixed(1)}
            </text>
            <text x={xAt(i)} y={height - 8} textAnchor="middle" fontSize={9} fill="var(--color-t3)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
