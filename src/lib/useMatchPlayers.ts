import { useMemo } from 'react'
import { useClubStore } from '../store/useClubStore'
import { useMatchesStore } from '../store/useMatchesStore'
import type { Player } from '../types/domain'

/** لاعبو النادي المشاركون بمباراة محددة، بترتيب قائمة النادي */
export function useMatchPlayers(matchId: string): Player[] {
  const clubPlayers = useClubStore((s) => s.players)
  const playerIds = useMatchesStore((s) => s.matches[matchId]?.playerIds)

  return useMemo(() => {
    if (!playerIds) return []
    const idSet = new Set(playerIds)
    return clubPlayers.filter((p) => idSet.has(p.id))
  }, [clubPlayers, playerIds])
}
