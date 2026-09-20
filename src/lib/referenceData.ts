import { supabase } from './supabase'
import type { CompetitionPreset, OpponentPreset } from '../types/domain'

/** قراءة عامة — متاحة لأي حساب مسجَّل دخول (RLS: auth.uid() is not null) */
export async function fetchReferenceClubs(): Promise<OpponentPreset[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('reference_clubs').select('id, name, logo').order('name')
  if (error || !data) return []
  return data as OpponentPreset[]
}

export async function fetchReferenceCompetitions(): Promise<CompetitionPreset[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('reference_competitions')
    .select('id, name, eligible_club_ids')
    .order('name')
  if (error || !data) return []
  return data.map((c) => ({
    id: c.id as string,
    name: c.name as string,
    eligibleOpponentIds: (c.eligible_club_ids as string[] | null) ?? [],
  }))
}

// كل ما يلي مقيَّد بحسابات المطوّر — الدوال الخادمية (security definer) تتحقق من ذلك داخلياً أيضاً

export async function adminAddReferenceClub(name: string, logo: string | null = null): Promise<string> {
  if (!supabase) throw new Error('الخدمة السحابية غير مُفعّلة')
  const { data, error } = await supabase.rpc('admin_add_reference_club', { club_name: name, club_logo: logo })
  if (error) throw new Error(error.message)
  return data as string
}

export async function adminRemoveReferenceClub(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_remove_reference_club', { club_id: id })
  if (error) throw new Error(error.message)
}

export async function adminSetReferenceClubLogo(id: string, logo: string | null): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_set_reference_club_logo', { club_id: id, club_logo: logo })
  if (error) throw new Error(error.message)
}

export async function adminAddReferenceCompetition(name: string): Promise<string> {
  if (!supabase) throw new Error('الخدمة السحابية غير مُفعّلة')
  const { data, error } = await supabase.rpc('admin_add_reference_competition', { competition_name: name })
  if (error) throw new Error(error.message)
  return data as string
}

export async function adminRemoveReferenceCompetition(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_remove_reference_competition', { competition_id: id })
  if (error) throw new Error(error.message)
}

export async function adminSetCompetitionEligibility(id: string, clubIds: string[]): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_set_competition_eligibility', {
    competition_id: id,
    club_ids: clubIds,
  })
  if (error) throw new Error(error.message)
}
