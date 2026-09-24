import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * تنبيه ثابت يظهر فور توفّر نسخة جديدة من التطبيق منشورة على الخادم — بديل عن الاعتماد
 * على التحديث الصامت لـ Service Worker الذي قد يتأخر أو لا يظهر للمستخدم فعلياً.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // يفحص وجود نسخة أحدث كل ساعة طالما التطبيق مفتوحاً، بدل انتظار إعادة فتح كاملة
      setInterval(() => registration.update(), 60 * 60 * 1000)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-s1 border border-bl rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-[92vw] animate-[slideUp_.25s_ease]">
      <span className="text-[12px] font-bold whitespace-nowrap">🔄 يتوفر تحديث جديد للتطبيق</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3.5 py-1.5 bg-pri text-white rounded-lg text-[12px] font-extrabold whitespace-nowrap"
      >
        تحديث الآن
      </button>
    </div>
  )
}
