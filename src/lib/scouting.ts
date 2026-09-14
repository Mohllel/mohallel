import { bestPlayer, commonErrors, worstPlayer, type PlayerRanking, type ErrorStat } from './analytics'
import { isMatchDecided } from './scoring'
import type { Action, Match, Player } from '../types/domain'

export interface ScoutingReport {
  opponentName: string
  matchesPlayed: number
  ourWins: number
  ourLosses: number
  hasRosterData: boolean
  opponentActions: Action[]
  bestPlayer: PlayerRanking | null
  worstPlayer: PlayerRanking | null
  errorLeaders: ErrorStat[]
  serveErrorLeaders: ErrorStat[]
  mostFrequentAttacker: { player: Player; count: number } | null
}

function serveErrorStats(players: Player[], actions: Action[]): ErrorStat[] {
  return players
    .map((player) => ({
      player,
      count: actions.filter((a) => a.playerId === player.id && a.skill === 'SS' && a.serveType === 'error').length,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
}

/**
 * تقرير تحضيري عن منافس محدد قبل مواجهته: يجمع كل المباريات السابقة ضده
 * (بغض النظر عن نتيجتها) ويحلّل بيانات لاعبيه المسجَّلة (إن وُجدت — تتطلب
 * روستر منافس محفوظ + تتبّع مهاراته من خريطة الملعب، ميزة Pro).
 */
export function buildScoutingReport(matches: Match[], opponentPresetId: string, opponentRoster: Player[]): ScoutingReport {
  const relevant = matches.filter((m) => m.opponentPresetId === opponentPresetId)
  const finished = relevant.filter((m) => m.status === 'finished')
  const ourWins = finished.filter((m) => isMatchDecided(m.setWinners) === 'A').length
  const ourLosses = finished.filter((m) => isMatchDecided(m.setWinners) === 'B').length

  const opponentActions = relevant.flatMap((m) => m.act.filter((a) => a.side === 'B'))
  const hasRosterData = opponentRoster.length > 0 && opponentActions.length > 0

  const attackCounts = opponentRoster
    .map((player) => ({ player, count: opponentActions.filter((a) => a.playerId === player.id && a.skill === 'S').length }))
    .filter((a) => a.count > 0)
    .sort((a, b) => b.count - a.count)

  return {
    opponentName: relevant[0]?.opponentName ?? '',
    matchesPlayed: relevant.length,
    ourWins,
    ourLosses,
    hasRosterData,
    opponentActions,
    bestPlayer: hasRosterData ? bestPlayer(opponentRoster, opponentActions) : null,
    worstPlayer: hasRosterData ? worstPlayer(opponentRoster, opponentActions) : null,
    errorLeaders: hasRosterData ? commonErrors(opponentRoster, opponentActions).slice(0, 3) : [],
    serveErrorLeaders: hasRosterData ? serveErrorStats(opponentRoster, opponentActions).slice(0, 3) : [],
    mostFrequentAttacker: attackCounts[0] ?? null,
  }
}
