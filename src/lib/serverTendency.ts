import { orderedPoints, reconstructSlotsAt } from './rotationEffectiveness'
import type { Match, TeamSide } from '../types/domain'

export interface ServerTendency {
  playerId: string
  pointsFor: number
  pointsAgainst: number
}

/**
 * لكل نقطة، من كان يشغل مركز الإرسال (الموقع ١) لفريقنا حينها — تُظهر أي دورة إرسال
 * (بحسب مَن يرسل) يستغلّها المنافس أكثر. تصلح لمباراة واحدة أو قائمة كاملة (مجمَّعة حسب اللاعب).
 */
export function computeServerTendency(matches: Match[], side: TeamSide): ServerTendency[] {
  const byPlayer = new Map<string, ServerTendency>()

  for (const match of matches) {
    const points = orderedPoints(match)
    for (const point of points) {
      const slots = reconstructSlotsAt(match, side, point.set, point.ts)
      const server = slots.find((s) => s.position === 1)?.playerId
      if (!server) continue

      if (!byPlayer.has(server)) byPlayer.set(server, { playerId: server, pointsFor: 0, pointsAgainst: 0 })
      const entry = byPlayer.get(server)!
      if (point.side === side) entry.pointsFor += 1
      else entry.pointsAgainst += 1
    }
  }

  return Array.from(byPlayer.values()).sort((a, b) => b.pointsAgainst - a.pointsAgainst)
}
