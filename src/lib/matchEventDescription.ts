import type { MatchEvent, Player, TeamSide } from '../types/domain'

export const MATCH_EVENT_ICON: Record<MatchEvent['type'], string> = {
  point: '🏐',
  timeout: '⏱',
  challenge: '🖥',
  substitution: '🔄',
}

export function describeMatchEvent(
  e: MatchEvent,
  ownName: string,
  opponentName: string,
  findPlayer: (side: TeamSide, playerId: string | undefined) => Player | undefined,
): string {
  const sideName = (side: TeamSide) => (side === 'A' ? ownName : opponentName)
  switch (e.type) {
    case 'point':
      return `نقطة لـ${sideName(e.side)}${e.zone ? ` — منطقة ${e.zone}` : ''}`
    case 'timeout':
      return `تايم آوت لـ${sideName(e.side)}`
    case 'challenge':
      return `تحدي (VAR) لـ${sideName(e.side)} — ${e.challengeResult === 'won' ? 'نجح ✅' : 'فشل ❌'}`
    case 'substitution': {
      const out = findPlayer(e.side, e.subOutPlayerId)
      const inP = findPlayer(e.side, e.subInPlayerId)
      return `تبديل ${sideName(e.side)}: خرج #${out?.number ?? '—'} دخل #${inP?.number ?? '—'}`
    }
    default:
      return ''
  }
}
