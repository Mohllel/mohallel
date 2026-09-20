import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'

let installed = false

function report(message: string, stack?: string) {
  const userId = useAuthStore.getState().user?.id
  if (!supabase || !userId) return
  supabase
    .from('client_errors')
    .insert({ user_id: userId, message: message.slice(0, 2000), stack: stack?.slice(0, 4000) ?? null, url: location.href })
    .then(() => {}, () => {})
}

/** يلتقط أخطاء العميل غير المتوقّعة ويرسلها لجدول client_errors لمراجعتها من لوحة المطوّر — بأفضل جهد، بلا أي تأثير على تجربة المستخدم عند الفشل */
export function installErrorReporting() {
  if (installed) return
  installed = true

  window.addEventListener('error', (e) => {
    report(e.message, e.error?.stack)
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    report(reason instanceof Error ? reason.message : String(reason), reason instanceof Error ? reason.stack : undefined)
  })
}
