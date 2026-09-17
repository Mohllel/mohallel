import { supabase } from './supabase'
import { useClubStore } from '../store/useClubStore'
import { useMatchesStore } from '../store/useMatchesStore'
import { useTrainingStore } from '../store/useTrainingStore'

export interface ClubMember {
  member_user_id: string
  email: string
  created_at: string
}

/** يدعو حساباً آخر (بالبريد) للعمل على بيانات نادي المستخدم الحالي — لصاحب النادي فقط */
export async function inviteClubMember(email: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('invite_club_member', { member_email: email })
  if (error) throw new Error(error.message)
}

export async function removeClubMember(memberUserId: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('remove_club_member', { target_user_id: memberUserId })
  if (error) throw new Error(error.message)
}

export async function listClubMembers(): Promise<ClubMember[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('list_club_members')
  if (error) throw new Error(error.message)
  return (data ?? []) as ClubMember[]
}

const STORE_BY_NAME = {
  'mohallel-club': useClubStore,
  'mohallel-matches': useMatchesStore,
  'mohallel-training': useTrainingStore,
} as const

/** يشترك بتحديثات بيانات نادٍ لحظياً — يُعيد ترطيب المتجر المتأثر فقط عند وصول تغيير من جهاز آخر */
export function subscribeToClubChanges(clubId: string): () => void {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`club_state_${clubId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'app_state', filter: `user_id=eq.${clubId}` },
      (payload) => {
        const storeName =
          (payload.new as { store_name?: string } | null)?.store_name ??
          (payload.old as { store_name?: string } | null)?.store_name
        const store = storeName ? STORE_BY_NAME[storeName as keyof typeof STORE_BY_NAME] : undefined
        store?.persist.rehydrate()
      },
    )
    .subscribe()

  return () => {
    supabase?.removeChannel(channel)
  }
}
