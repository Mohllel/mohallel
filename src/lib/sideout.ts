import { otherSide, pointSideForAction } from './scoring'
import type { Match, TeamSide } from '../types/domain'

interface ScoredPoint {
  ts: number
  side: TeamSide
}

/** كل النقاط المسجَّلة لشوط معيّن (من إجراءات دقيق/سريع + أحداث خريطة الملعب)، مرتبة زمنياً */
function orderedPointsForSet(match: Match, setNo: number): ScoredPoint[] {
  const fromActions: ScoredPoint[] = match.act
    .filter((a) => a.set === setNo)
    .map((a) => {
      const side = pointSideForAction(a.side, a.skill, a.quality, a.serveType)
      return side ? { ts: a.ts, side } : null
    })
    .filter((p): p is ScoredPoint => p !== null)

  const fromEvents: ScoredPoint[] = match.events
    .filter((e) => e.set === setNo)
    .map((e) => {
      if (e.type === 'point') return { ts: e.ts, side: e.side }
      if (e.type === 'challenge' && e.challengeResult === 'won') return { ts: e.ts, side: e.side }
      return null
    })
    .filter((p): p is ScoredPoint => p !== null)

  return [...fromActions, ...fromEvents].sort((a, b) => a.ts - b.ts)
}

/** أول إرسال مسجَّل بالشوط يحدد من بدأ بالإرسال؛ الافتراضي 'A' إن لم يوجد */
function detectFirstServer(match: Match, setNo: number): TeamSide {
  const firstServe = match.act
    .filter((a) => a.set === setNo && a.skill === 'SS')
    .sort((a, b) => a.ts - b.ts)[0]
  return firstServe?.side ?? 'A'
}

export interface SideoutStats {
  received: number
  won: number
  pct: number
}

const emptyStats = (): SideoutStats => ({ received: 0, won: 0, pct: 0 })

/**
 * نسبة صد الإرسال: من بين كل مرة استقبل فيها الفريق الإرسال (لم يكن هو المُرسِل)،
 * كم مرة فاز بالنقطة؟ يُشتق ترتيب الإرسال من قاعدة "الفائز بالنقطة يُرسل تالياً"
 * بدءاً من أول إرسال مسجَّل بكل شوط (أو 'A' افتراضياً بلا بيانات).
 */
export function computeMatchSideout(match: Match): Record<TeamSide, SideoutStats> {
  const totals: Record<TeamSide, SideoutStats> = { A: emptyStats(), B: emptyStats() }

  for (let setNo = 1; setNo <= 5; setNo++) {
    const points = orderedPointsForSet(match, setNo)
    if (points.length === 0) continue

    let currentServer = detectFirstServer(match, setNo)
    for (const point of points) {
      const receivingSide = otherSide(currentServer)
      totals[receivingSide].received += 1
      if (point.side === receivingSide) totals[receivingSide].won += 1
      currentServer = point.side
    }
  }

  totals.A.pct = totals.A.received ? Math.round((totals.A.won / totals.A.received) * 100) : 0
  totals.B.pct = totals.B.received ? Math.round((totals.B.won / totals.B.received) * 100) : 0
  return totals
}

/** تجميع نسبة صد الإرسال عبر عدة مباريات (لفريقك 'A' فقط عادة) */
export function computeAggregateSideout(matches: Match[]): Record<TeamSide, SideoutStats> {
  const totals: Record<TeamSide, SideoutStats> = { A: emptyStats(), B: emptyStats() }
  for (const m of matches) {
    const s = computeMatchSideout(m)
    for (const side of ['A', 'B'] as TeamSide[]) {
      totals[side].received += s[side].received
      totals[side].won += s[side].won
    }
  }
  totals.A.pct = totals.A.received ? Math.round((totals.A.won / totals.A.received) * 100) : 0
  totals.B.pct = totals.B.received ? Math.round((totals.B.won / totals.B.received) * 100) : 0
  return totals
}
