import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** null إن لم تُضبط متغيرات البيئة — الميزات السحابية (البث المباشر) تُعطَّل بأمان بدلاً من الانهيار */
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isCloudEnabled = supabase !== null
