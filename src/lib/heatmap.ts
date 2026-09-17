import type { Match } from '../types/domain'

/**
 * لكل حدث نقطة من خريطة الملعب، مكان السقوط دائماً بملعب الطرف الآخر عن من سجّل النقطة —
 * فنقاط جانبنا (side==='A') تكشف أين نسجّل نحن، ونقاط المنافس تكشف أين يسجّل هو ضدنا.
 * تصلح لمباراة واحدة (مصفوفة بعنصر واحد) أو قائمة كاملة لتجميع كل المباريات.
 */
export function computeZoneHeatmap(matches: Match[]): { own: number[]; opponent: number[] } {
  const own = [0, 0, 0, 0, 0, 0]
  const opponent = [0, 0, 0, 0, 0, 0]

  for (const match of matches) {
    for (const event of match.events) {
      if (event.type !== 'point' || !event.zone) continue
      const arr = event.side === 'A' ? own : opponent
      arr[event.zone - 1] += 1
    }
  }

  return { own, opponent }
}
