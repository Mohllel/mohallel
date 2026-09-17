import type { StateStorage } from 'zustand/middleware'
import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'

/** مهايئ تخزين لـ Zustand persist يقرأ/يكتب في جدول app_state بدل localStorage، معزولاً حسب النادي النشط حالياً (نفسك أو نادٍ دُعيت إليه) */
export const supabaseStorage: StateStorage = {
  getItem: async (name) => {
    const clubId = useAuthStore.getState().activeClubId
    if (!supabase || !clubId) return null

    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('user_id', clubId)
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
    const clubId = useAuthStore.getState().activeClubId
    if (!supabase || !clubId) return

    const { error } = await supabase.from('app_state').upsert({
      user_id: clubId,
      store_name: name,
      data: JSON.parse(value),
      updated_at: new Date().toISOString(),
    })
    if (error) console.error(`[supabaseStorage] فشل حفظ "${name}":`, error.message)
  },

  removeItem: async (name) => {
    const clubId = useAuthStore.getState().activeClubId
    if (!supabase || !clubId) return

    const { error } = await supabase.from('app_state').delete().eq('user_id', clubId).eq('store_name', name)
    if (error) console.error(`[supabaseStorage] فشل حذف "${name}":`, error.message)
  },
}
