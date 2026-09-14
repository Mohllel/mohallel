import { COURT_POSITIONS } from '../constants/courtPositions'
import { QUALITIES } from '../constants/quality'
import { SKILLS } from '../constants/skills'
import type { Action, Player, RotationPosition } from '../types/domain'

/** المهارات التي تُنهي الكرة لصالح اللاعب عند تقييم ممتاز — نفس قاعدة lib/scoring */
const POINT_SKILLS = ['S', 'SS', 'B']

const MIN_ACTIONS_FOR_RANKING = 3

export interface PlayerRanking {
  player: Player
  total: number
  average: number
}

function overallAverage(actions: Action[], playerId: string) {
  const mine = actions.filter((a) => a.playerId === playerId)
  const total = mine.length
  const average = total ? mine.reduce((sum, a) => sum + a.quality, 0) / total : 0
  return { total, average }
}

function rankPlayers(players: Player[], actions: Action[]): PlayerRanking[] {
  return players
    .map((player) => {
      const { total, average } = overallAverage(actions, player.id)
      return { player, total, average }
    })
    .filter((r) => r.total >= MIN_ACTIONS_FOR_RANKING)
}

export function bestPlayer(players: Player[], actions: Action[]): PlayerRanking | null {
  const ranked = rankPlayers(players, actions).sort((a, b) => b.average - a.average || b.total - a.total)
  return ranked[0] ?? null
}

export function topPlayers(players: Player[], actions: Action[], n: number): PlayerRanking[] {
  return rankPlayers(players, actions)
    .sort((a, b) => b.average - a.average || b.total - a.total)
    .slice(0, n)
}

export function worstPlayer(players: Player[], actions: Action[]): PlayerRanking | null {
  const ranked = rankPlayers(players, actions).sort((a, b) => a.average - b.average || b.total - a.total)
  return ranked[0] ?? null
}

export interface ErrorStat {
  player: Player
  count: number
}

export function commonErrors(players: Player[], actions: Action[]): ErrorStat[] {
  return players
    .map((player) => ({
      player,
      count: actions.filter((a) => a.playerId === player.id && a.skill === 'F').length,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
}

/** عدد النقاط الشخصية التي حسمها اللاعب (هجوم/إرسال/بلوك بتقييم ممتاز) */
export function playerPoints(actions: Action[], playerId: string): number {
  return actions.filter((a) => a.playerId === playerId && a.quality === 3 && POINT_SKILLS.includes(a.skill)).length
}

/** عدد أخطاء اللاعب (مهارة الأخطاء F) */
export function playerErrorCount(actions: Action[], playerId: string): number {
  return actions.filter((a) => a.playerId === playerId && a.skill === 'F').length
}

/** مصفوفة 9×4 (مهارة × تقييم) لعدد مرات كل خانة — أساس الخريطة الحرارية */
export function skillQualityMatrix(actions: Action[], playerId: string): number[][] {
  const mine = actions.filter((a) => a.playerId === playerId)
  return SKILLS.map((s) => QUALITIES.map((q) => mine.filter((a) => a.skill === s.k && a.quality === q.v).length))
}

export interface LineupSuggestionSlot {
  position: RotationPosition
  player: Player | null
}

/**
 * اقتراح إحصائي مبسّط: يرتّب أفضل 6 لاعبين بمتوسط التقييم العام تنازلياً
 * ويوزّعهم على المواقع الستة بنفس الترتيب — ليس تحليلاً تكتيكياً كاملاً بالأدوار.
 */
export function suggestLineup(players: Player[], actions: Action[]): LineupSuggestionSlot[] {
  const ranked = rankPlayers(players, actions).sort((a, b) => b.average - a.average || b.total - a.total)
  const top6 = ranked.slice(0, 6).map((r) => r.player)
  const positions = COURT_POSITIONS.map((cp) => cp.position).sort((a, b) => a - b)
  return positions.map((position, i) => ({ position, player: top6[i] ?? null }))
}
