import type { Match } from '../types/domain'

const POINT_SKILLS = ['S', 'SS', 'B']

export interface PlayerTrendPoint {
  matchId: string
  date: string
  opponentName: string
  average: number
  total: number
  points: number
  errors: number
}

/** أداء لاعب عبر كل مباراة شارك فيها فعلياً (له إجراء واحد على الأقل)، مرتَّبة زمنياً */
export function computePlayerTrend(matches: Match[], playerId: string): PlayerTrendPoint[] {
  return [...matches]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((m) => {
      const mine = m.act.filter((a) => a.playerId === playerId)
      if (mine.length === 0) return null
      const average = mine.reduce((sum, a) => sum + a.quality, 0) / mine.length
      const points = mine.filter((a) => a.quality === 3 && POINT_SKILLS.includes(a.skill)).length
      const errors = mine.filter((a) => a.skill === 'F').length
      return { matchId: m.id, date: m.date, opponentName: m.opponentName, average, total: mine.length, points, errors }
    })
    .filter((p): p is PlayerTrendPoint => p !== null)
}
