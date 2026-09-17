import { supabase } from './supabase'

export interface AdminClubRow {
  user_id: string
  email: string
  club_name: string | null
  user_name: string | null
  is_pro: boolean
  updated_at: string
  member_count: number
}

export interface AdminUserRow {
  user_id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  last_data_update: string | null
  owns_club: boolean
  is_admin: boolean
  member_of_emails: string[] | null
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

export async function fetchAllUsers(): Promise<AdminUserRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminUserRow[]
}

export type UserStatus = 'active' | 'inactive' | 'incomplete'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const INCOMPLETE_GRACE_MS = 3 * 24 * 60 * 60 * 1000

/** نشط: دخول أو تحديث بيانات خلال ٣٠ يوماً. غير مكتمل: لا يملك نادياً بعد ٣ أيام من التسجيل (تُقدَّم على نشط/غير نشط). */
export function computeUserStatus(row: AdminUserRow): UserStatus {
  const now = Date.now()
  const createdAt = new Date(row.created_at).getTime()
  if (!row.owns_club && now - createdAt > INCOMPLETE_GRACE_MS) return 'incomplete'

  const lastActivity = Math.max(
    row.last_sign_in_at ? new Date(row.last_sign_in_at).getTime() : 0,
    row.last_data_update ? new Date(row.last_data_update).getTime() : 0,
  )
  return lastActivity > 0 && now - lastActivity <= THIRTY_DAYS_MS ? 'active' : 'inactive'
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
