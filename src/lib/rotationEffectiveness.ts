import { pointSideForAction } from './scoring'
import type { Match, TeamSide } from '../types/domain'

interface ScoredPoint {
  ts: number
  set: number
  side: TeamSide
}

function orderedPoints(match: Match): ScoredPoint[] {
  const fromActions: ScoredPoint[] = match.act
    .map((a) => {
      const side = pointSideForAction(a.side, a.skill, a.quality, a.serveType)
      return side ? { ts: a.ts, set: a.set, side } : null
    })
    .filter((p): p is ScoredPoint => p !== null)

  const fromEvents: ScoredPoint[] = match.events
    .map((e) => {
      if (e.type === 'point') return { ts: e.ts, set: e.set, side: e.side }
      if (e.type === 'challenge' && e.challengeResult === 'won') return { ts: e.ts, set: e.set, side: e.side }
      return null
    })
    .filter((p): p is ScoredPoint => p !== null)

  return [...fromActions, ...fromEvents].sort((a, b) => a.ts - b.ts)
}

/**
 * لاعبو الملعب الستة لحظة زمنية معيّنة. مهم: match.rotation[side][setNo] يعكس
 * آخر حالة حالية (تُحدَّث مباشرة مع كل تبديل)، وليس التشكيلة الأصلية عند بداية
 * الشوط — لذا نُعيد البناء بالرجوع من الحالة الحالية وإلغاء أي تبديل وقع
 * *بعد* اللحظة المطلوبة، بترتيب زمني عكسي.
 */
function onCourtAt(match: Match, side: TeamSide, setNo: number, atTs: number): string[] {
  let roster = (match.rotation[side]?.[setNo]?.map((s) => s.playerId) ?? []) as (string | null)[]

  const laterSubs = match.events
    .filter((e) => e.type === 'substitution' && e.side === side && e.set === setNo && e.ts > atTs)
    .sort((a, b) => b.ts - a.ts)

  for (const sub of laterSubs) {
    roster = roster.map((id) => (id === sub.subInPlayerId ? sub.subOutPlayerId ?? id : id))
  }
  return roster.filter((id): id is string => !!id)
}

export interface RotationStint {
  set: number
  playerIds: string[]
  pointsFor: number
  pointsAgainst: number
}

/**
 * لكل تركيبة لاعبين ستة مختلفة استُخدمت في الملعب (لفريق واحد عبر شوط واحد)،
 * كم نقطة سُجّلت له وعليه أثناء وجودها — يتطلب تشكيلة بداية مسجَّلة للشوط،
 * ويُحدَّث تلقائياً مع كل حدث تبديل مسجَّل.
 */
export function computeRotationEffectiveness(match: Match, side: TeamSide): RotationStint[] {
  const points = orderedPoints(match)
  const stints = new Map<string, RotationStint>()

  for (const point of points) {
    const onCourt = onCourtAt(match, side, point.set, point.ts)
    if (onCourt.length < 6) continue // تشكيلة غير مكتملة، لا يمكن الاعتماد عليها للمقارنة

    const key = `${point.set}|${[...onCourt].sort().join(',')}`
    if (!stints.has(key)) {
      stints.set(key, { set: point.set, playerIds: onCourt, pointsFor: 0, pointsAgainst: 0 })
    }
    const stint = stints.get(key)!
    if (point.side === side) stint.pointsFor += 1
    else stint.pointsAgainst += 1
  }

  return Array.from(stints.values()).sort(
    (a, b) => b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst),
  )
}
