import { supabase } from './supabase'
import { useClubStore } from '../store/useClubStore'
import { useMatchesStore } from '../store/useMatchesStore'
import { useTrainingStore } from '../store/useTrainingStore'

const LOCAL_KEYS = ['mohallel-club', 'mohallel-matches', 'mohallel-training']

/** إن لم يكن للمستخدم بيانات سحابية بعد ووُجدت بيانات محلية على هذا الجهاز، يعرض تأكيداً ثم يرفعها */
export async function checkAndOfferLocalImport(userId: string): Promise<void> {
  if (!supabase) return

  const { count } = await supabase
    .from('app_state')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (count && count > 0) return

  const localEnvelopes = LOCAL_KEYS.map((key) => {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      if (!parsed?.state || Object.keys(parsed.state).length === 0) return null
      return { key, envelope: parsed }
    } catch {
      return null
    }
  }).filter((x): x is { key: string; envelope: unknown } => x !== null)

  if (localEnvelopes.length === 0) return

  const confirmed = window.confirm(
    'وجدنا بيانات محلية على هذا الجهاز (نادٍ/مباريات سابقة). هل تريد استيرادها لحسابك الجديد؟',
  )
  if (!confirmed) return

  for (const { key, envelope } of localEnvelopes) {
    await supabase.from('app_state').upsert({
      user_id: userId,
      store_name: key,
      data: envelope,
      updated_at: new Date().toISOString(),
    })
  }

  await Promise.all([
    useClubStore.persist.rehydrate(),
    useMatchesStore.persist.rehydrate(),
    useTrainingStore.persist.rehydrate(),
  ])
}
