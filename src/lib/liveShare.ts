import { supabase } from './supabase'
import type { Match, TeamSide } from '../types/domain'

export interface LiveMatchRow {
  id: string
  club_name: string
  club_logo: string | null
  opponent_name: string
  opponent_logo: string | null
  set_no: number
  s_a: number[]
  s_b: number[]
  set_winners: (TeamSide | null)[]
  status: string
  serving_side: TeamSide | null
  updated_at: string
}

export interface LiveMatchView {
  clubName: string
  clubLogo: string | null
  opponentName: string
  opponentLogo: string | null
  set: number
  sA: number[]
  sB: number[]
  setWinners: (TeamSide | null)[]
  status: string
  servingSide: TeamSide | null
  updatedAt: string
}

function rowToView(row: LiveMatchRow): LiveMatchView {
  return {
    clubName: row.club_name,
    clubLogo: row.club_logo,
    opponentName: row.opponent_name,
    opponentLogo: row.opponent_logo,
    set: row.set_no,
    sA: row.s_a,
    sB: row.s_b,
    setWinners: row.set_winners,
    status: row.status,
    servingSide: row.serving_side,
    updatedAt: row.updated_at,
  }
}

/** يرفع/يحدّث حالة المباراة الحالية إلى جدول live_matches — يفشل بصمت إن لم تتوفر السحابة */
export async function pushLiveMatch(match: Match, clubName: string, clubLogo: string | null): Promise<void> {
  if (!supabase) return
  const row: Omit<LiveMatchRow, 'updated_at'> = {
    id: match.id,
    club_name: clubName || 'فريقك',
    club_logo: clubLogo,
    opponent_name: match.opponentName || 'المنافس',
    opponent_logo: match.opponentLogo,
    set_no: match.set,
    s_a: match.sA,
    s_b: match.sB,
    set_winners: match.setWinners,
    status: match.status,
    serving_side: match.servingSide?.[match.set] ?? null,
  }
  await supabase.from('live_matches').upsert(row)
}

export async function fetchLiveMatch(matchId: string): Promise<LiveMatchView | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('live_matches').select('*').eq('id', matchId).maybeSingle()
  if (error || !data) return null
  return rowToView(data as LiveMatchRow)
}

export function subscribeLiveMatch(matchId: string, onUpdate: (view: LiveMatchView) => void): () => void {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`live_match_${matchId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'live_matches', filter: `id=eq.${matchId}` },
      (payload) => {
        if (payload.new) onUpdate(rowToView(payload.new as LiveMatchRow))
      },
    )
    .subscribe()

  return () => {
    supabase?.removeChannel(channel)
  }
}
