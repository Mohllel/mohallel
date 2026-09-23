import { useCountUp } from '../../lib/useCountUp'

interface HomeStatsProps {
  matchesPlayed: number
  winRate: number
  playersCount: number
}

/** شريط إحصائيات سريعة أعلى الصفحة الرئيسية — الأرقام تتصاعد بأنيميشن عند ظهور الصفحة */
export function HomeStats({ matchesPlayed, winRate, playersCount }: HomeStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <StatTile value={matchesPlayed} label="مباريات" delayMs={0} />
      <StatTile value={winRate} suffix="%" label="نسبة الفوز" delayMs={90} />
      <StatTile value={playersCount} label="لاعبون" delayMs={180} />
    </div>
  )
}

interface StatTileProps {
  value: number
  suffix?: string
  label: string
  delayMs: number
}

function StatTile({ value, suffix = '', label, delayMs }: StatTileProps) {
  const animated = useCountUp(value)
  return (
    <div
      className="bg-s1 border border-bd rounded-2xl py-3 text-center animate-[fadeIn_.5s_ease_both]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="text-[20px] font-black text-pri">
        {animated}
        {suffix}
      </div>
      <div className="text-[10px] text-t3 font-bold mt-0.5">{label}</div>
    </div>
  )
}
