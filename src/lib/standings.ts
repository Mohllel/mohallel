import type { Match } from '../types/domain'
import { countSetWins, isMatchDecided } from './scoring'

export interface StandingsRow {
  team: string
  played: number
  won: number
  lost: number
  setsFor: number
  setsAgainst: number
  points: number
}

/** نقاط فيفا: فوز 3-0/3-1=3، فوز 3-2=2، خسارة 2-3=1، خسارة 0-3/1-3=0 */
function matchPoints(ownSetsWon: number, ownSetsLost: number, won: boolean): number {
  if (won) return ownSetsLost <= 1 ? 3 : 2
  return ownSetsWon === 2 ? 1 : 0
}

export function computeStandings(matches: Match[], clubName: string): StandingsRow[] {
  const rows = new Map<string, StandingsRow>()
  const ensure = (team: string): StandingsRow => {
    if (!rows.has(team)) {
      rows.set(team, { team, played: 0, won: 0, lost: 0, setsFor: 0, setsAgainst: 0, points: 0 })
    }
    return rows.get(team)!
  }

  const finished = matches.filter((m) => m.status === 'finished')
  const club = clubName || 'فريقك'

  for (const m of finished) {
    const winner = isMatchDecided(m.setWinners)
    if (!winner) continue
    const setsA = countSetWins(m.setWinners, 'A')
    const setsB = countSetWins(m.setWinners, 'B')

    const clubRow = ensure(club)
    const oppRow = ensure(m.opponentName || 'منافس')

    clubRow.played += 1
    oppRow.played += 1
    clubRow.setsFor += setsA
    clubRow.setsAgainst += setsB
    oppRow.setsFor += setsB
    oppRow.setsAgainst += setsA

    const clubWon = winner === 'A'
    if (clubWon) {
      clubRow.won += 1
      oppRow.lost += 1
    } else {
      clubRow.lost += 1
      oppRow.won += 1
    }
    clubRow.points += matchPoints(setsA, setsB, clubWon)
    oppRow.points += matchPoints(setsB, setsA, !clubWon)
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const ratioA = a.setsAgainst ? a.setsFor / a.setsAgainst : a.setsFor
    const ratioB = b.setsAgainst ? b.setsFor / b.setsAgainst : b.setsFor
    return ratioB - ratioA
  })
}
