import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  /** لا يزال يحاول معرفة إن كانت هناك جلسة محفوظة سابقاً */
  loading: boolean
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  user: null,
  loading: true,

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

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, user: data.session?.user ?? null, loading: false })
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null, loading: false })
  })
} else {
  useAuthStore.setState({ loading: false })
}
