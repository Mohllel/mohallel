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

export interface SignupGrowthPoint {
  monthKey: string
  label: string
  count: number
}

/** عدد التسجيلات الجديدة لكل شهر — من created_at الموجود أصلاً بـ admin_list_users()، بلا استعلام إضافي */
export function computeSignupGrowth(users: AdminUserRow[]): SignupGrowthPoint[] {
  const counts = new Map<string, number>()
  for (const u of users) {
    const d = new Date(u.created_at)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    counts.set(monthKey, (counts.get(monthKey) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, count]) => {
      const [year, month] = monthKey.split('-').map(Number)
      const label = new Date(year, month - 1, 1).toLocaleDateString('ar', { month: 'short', year: 'numeric' })
      return { monthKey, label, count }
    })
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

export async function fetchAiPrompt(): Promise<string> {
  if (!supabase) return ''
  const { data, error } = await supabase.from('ai_config').select('enhance_prompt').eq('id', true).maybeSingle()
  if (error || !data) return ''
  return data.enhance_prompt as string
}

export async function setAiPrompt(prompt: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_set_ai_prompt', { new_prompt: prompt })
  if (error) throw new Error(error.message)
}

export interface FeatureFlag {
  key: string
  enabled: boolean
  description: string
  updated_at: string
}

export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('feature_flags').select('*').order('key')
  if (error || !data) return []
  return data as FeatureFlag[]
}

export async function upsertFeatureFlag(key: string, enabled: boolean, description: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_upsert_feature_flag', {
    flag_key: key,
    flag_enabled: enabled,
    flag_description: description,
  })
  if (error) throw new Error(error.message)
}

export async function deleteFeatureFlag(key: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_delete_feature_flag', { flag_key: key })
  if (error) throw new Error(error.message)
}

export interface ClientErrorRow {
  id: number
  user_id: string | null
  message: string
  stack: string | null
  url: string | null
  created_at: string
}

export async function fetchClientErrors(limit = 100): Promise<ClientErrorRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_client_errors', { limit_count: limit })
  if (error) throw new Error(error.message)
  return (data ?? []) as ClientErrorRow[]
}

/** ينقل بيانات النادي الحالية بحساب المطوّر (الملف، اللاعبون، المباريات، التدريب) لحساب آخر مسجَّل بالفعل — فصل نهائي بين الحسابين */
export async function migrateClubDataTo(targetEmail: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('admin_migrate_club_data', { target_email: targetEmail })
  if (error) throw new Error(error.message)
}
