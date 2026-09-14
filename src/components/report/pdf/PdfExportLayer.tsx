import type { RefObject } from 'react'
import type { Action, Match, Player } from '../../../types/domain'
import { CoverCard } from './CoverCard'
import { PlayerCard } from './PlayerCard'

interface PdfExportLayerProps {
  match: Match
  players: Player[]
  actions: Action[]
  clubName: string
  clubLogo: string | null
  coverRef: RefObject<HTMLDivElement | null>
  playerRefs: RefObject<HTMLDivElement | null>[]
}

/** طبقة مخفية خارج الشاشة تحمل بطاقات الغلاف واللاعبين لالتقاطها عند تصدير PDF */
export function PdfExportLayer({ match, players, actions, clubName, clubLogo, coverRef, playerRefs }: PdfExportLayerProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: -99999, pointerEvents: 'none' }} aria-hidden="true">
      <CoverCard ref={coverRef} match={match} players={players} actions={actions} clubName={clubName} clubLogo={clubLogo} />
      {players.map((p, i) => (
        <PlayerCard key={p.id} ref={playerRefs[i]} player={p} actions={actions} />
      ))}
    </div>
  )
}
