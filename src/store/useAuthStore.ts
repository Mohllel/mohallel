import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  /** لا يزال يحاول معرفة إن كانت هناك جلسة محفوظة سابقاً */
  loading: boolean
  /** هل المستخدم الحالي عضو بجدول admins (وصول مطوّر كامل للمنصة) */
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(() => ({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,

  signUp: async (email, password) => {
    if (!supabase) return 'الخدمة السحابية غير مُفعّلة'
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  },
  signIn: async (email, password) => {
    if (!supabase) return 'الخدمة السحابية غير مُفعّلة'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  },
  signOut: async () => {
    await supabase?.auth.signOut()
  },
}))

async function refreshAdminStatus(userId: string | undefined) {
  if (!supabase || !userId) {
    useAuthStore.setState({ isAdmin: false })
    return
  }
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
  useAuthStore.setState({ isAdmin: !!data })
}

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, user: data.session?.user ?? null, loading: false })
    refreshAdminStatus(data.session?.user?.id)
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null, loading: false })
    refreshAdminStatus(session?.user?.id)
  })
} else {
  useAuthStore.setState({ loading: false })
}
