import type { PlayerPosition } from '../types/domain'

export const PLAYER_POSITIONS: PlayerPosition[] = ['setter', 'hitter4', 'hitter3', 'hitter2', 'libero']

export const PLAYER_POSITION_LABELS: Record<PlayerPosition, string> = {
  setter: 'معد',
  hitter4: 'ضارب ٤',
  hitter3: 'ضارب ٣',
  hitter2: 'ضارب ٢',
  libero: 'ليبرو',
}
