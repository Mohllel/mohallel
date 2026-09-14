import { QUALITIES } from '../constants/quality'
import { SKILLS } from '../constants/skills'
import type { Action, Quality, SkillKey } from '../types/domain'

export interface SkillStat {
  t: number
  avg: string
  cn: number[]
}

export type PlayerStats = Record<SkillKey, SkillStat> & { tot: number }

/** إحصائيات لاعب حسب المهارة، اختيارياً لشوط محدد */
export function playerStats(actions: Action[], playerId: string, setNo?: number | null): PlayerStats {
  const filtered = actions.filter((a) => a.playerId === playerId && (setNo == null || a.set === setNo))
  const stats = {} as PlayerStats
  for (const s of SKILLS) {
    const sa = filtered.filter((a) => a.skill === s.k)
    stats[s.k] = {
      t: sa.length,
      avg: sa.length ? (sa.reduce((sum, a) => sum + a.quality, 0) / sa.length).toFixed(1) : '—',
      cn: QUALITIES.map((q) => sa.filter((a) => a.quality === q.v).length),
    }
  }
  stats.tot = filtered.length
  return stats
}

export function cellCount(actions: Action[], playerId: string, skill: SkillKey, setNo?: number | null): number {
  return actions.filter((a) => a.playerId === playerId && a.skill === skill && (setNo == null || a.set === setNo)).length
}

export function skillTotal(actions: Action[], skill: SkillKey, setNo?: number | null): number {
  return actions.filter((a) => a.skill === skill && (setNo == null || a.set === setNo)).length
}

export function playerTotalInSet(actions: Action[], playerId: string, setNo: number): number {
  return actions.filter((a) => a.playerId === playerId && a.set === setNo).length
}

export const initials = (name: string): string => {
  const parts = name.trim().split(' ')
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.substring(0, 2)
}

export const resolveServeQuality = (serveType: 'normal' | 'float' | 'ace' | 'error'): Quality | null => {
  if (serveType === 'ace') return 3
  if (serveType === 'error') return 0
  return null
}
