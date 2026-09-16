import type { StateStorage } from 'zustand/middleware'
import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'

/** مهايئ تخزين لـ Zustand persist يقرأ/يكتب في جدول app_state بدل localStorage، معزولاً حسب هوية المستخدم الحالي */
export const supabaseStorage: StateStorage = {
  getItem: async (name) => {
    const userId = useAuthStore.getState().user?.id
    if (!supabase || !userId) return null

    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('user_id', userId)
      .eq('store_name', name)
      .maybeSingle()

    if (error) {
      console.error(`[supabaseStorage] فشلت قراءة "${name}":`, error.message)
      return null
    }
    if (!data) return null
    return JSON.stringify(data.data)
  },

  setItem: async (name, value) => {
    const userId = useAuthStore.getState().user?.id
    if (!supabase || !userId) return

    const { error } = await supabase.from('app_state').upsert({
      user_id: userId,
      store_name: name,
      data: JSON.parse(value),
      updated_at: new Date().toISOString(),
    })
    if (error) console.error(`[supabaseStorage] فشل حفظ "${name}":`, error.message)
  },

  removeItem: async (name) => {
    const userId = useAuthStore.getState().user?.id
    if (!supabase || !userId) return

    const { error } = await supabase.from('app_state').delete().eq('user_id', userId).eq('store_name', name)
    if (error) console.error(`[supabaseStorage] فشل حذف "${name}":`, error.message)
  },
}
