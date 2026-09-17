import { supabase } from './supabase'

export interface AdminClubRow {
  user_id: string
  email: string
  club_name: string | null
  user_name: string | null
  is_pro: boolean
  updated_at: string
}

export interface PlatformStats {
  total_clubs: number
  total_pro: number
  total_matches: number
}

export interface AppSettings {
  maintenance_mode: boolean
  announcement: string
}

export async function fetchAllClubs(): Promise<AdminClubRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_clubs')
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminClubRow[]
}

export async function setClubPro(userId: string, isPro: boolean): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_set_pro', { target_user_id: userId, pro_value: isPro })
  if (error) throw new Error(error.message)
}

export async function fetchPlatformStats(): Promise<PlatformStats | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('admin_platform_stats')
  if (error) throw new Error(error.message)
  return (data?.[0] as PlatformStats) ?? null
}

export async function fetchAppSettings(): Promise<AppSettings> {
  if (!supabase) return { maintenance_mode: false, announcement: '' }
  const { data, error } = await supabase
    .from('app_settings')
    .select('maintenance_mode, announcement')
    .eq('id', true)
    .maybeSingle()
  if (error || !data) return { maintenance_mode: false, announcement: '' }
  return data as AppSettings
}

export async function updateAppSettings(settings: AppSettings): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('app_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', true)
  if (error) throw new Error(error.message)
}
