import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Membership {
  club_owner_id: string
  club_owner_email: string
}

interface AuthState {
  session: Session | null
  user: User | null
  /** لا يزال يحاول معرفة إن كانت هناك جلسة محفوظة سابقاً */
  loading: boolean
  /** هل المستخدم الحالي عضو بجدول admins (وصول مطوّر كامل للمنصة) */
  isAdmin: boolean
  /** معرّف النادي (= user_id صاحبه) الذي يعمل عليه المستخدم الحالي الآن — إما نفسه أو نادٍ دُعي إليه */
  activeClubId: string | null
  /** الأندية التي دُعي إليها المستخدم الحالي كعضو (غير نادي نفسه) */
  memberships: Membership[]
  setActiveClubId: (id: string) => void
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(() => ({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  activeClubId: null,
  memberships: [],

  setActiveClubId: (id) => useAuthStore.setState({ activeClubId: id }),

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

async function refreshMemberships(userId: string | undefined) {
  if (!supabase || !userId) {
    useAuthStore.setState({ memberships: [] })
    return
  }
  const { data, error } = await supabase.rpc('list_my_memberships')
  if (error || !data) return
  const memberships = data as Membership[]
  useAuthStore.setState({ memberships })
  if (memberships.length === 1) {
    useAuthStore.setState({ activeClubId: memberships[0].club_owner_id })
  }
}

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    const userId = data.session?.user?.id
    useAuthStore.setState({
      session: data.session,
      user: data.session?.user ?? null,
      loading: false,
      activeClubId: userId ?? null,
    })
    refreshAdminStatus(userId)
    refreshMemberships(userId)
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user?.id
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      loading: false,
      activeClubId: userId ?? null,
      memberships: [],
    })
    refreshAdminStatus(userId)
    refreshMemberships(userId)
  })
} else {
  useAuthStore.setState({ loading: false })
}
