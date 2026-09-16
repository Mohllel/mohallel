import type { Match } from '../types/domain'

/** أقرب مباراة قادمة (بتاريخ اليوم أو بعده)، أو الأقرب من الماضي إن لم توجد قادمة */
export function getNextMatch(matches: Record<string, Match>): Match | null {
  const scheduled = Object.values(matches).filter((m) => m.status === 'scheduled')
  if (scheduled.length === 0) return null

  const today = new Date().toISOString().split('T')[0]
  const upcoming = scheduled.filter((m) => m.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  if (upcoming.length > 0) return upcoming[0]

  const past = scheduled.sort((a, b) => b.date.localeCompare(a.date))
  return past[0]
}
