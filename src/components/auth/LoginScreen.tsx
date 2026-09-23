import { useState } from 'react'
import { Logo } from '../brand/Logo'
import { useAuthStore } from '../../store/useAuthStore'

type Mode = 'signin' | 'signup' | 'forgot'

export function LoginScreen() {
  const { signIn, signUp, resetPasswordForEmail } = useAuthStore()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'forgot') {
      const err = await resetPasswordForEmail(email.trim())
      setLoading(false)
      if (err) {
        setError(err)
        return
      }
      setInfo('إن كان هذا البريد مسجَّلاً لدينا، وصلته رسالة برابط لتعيين كلمة مرور جديدة.')
      return
    }

    const fn = mode === 'signin' ? signIn : signUp
    const err = await fn(email.trim(), password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    if (mode === 'signup') {
      setInfo('تم إنشاء الحساب. إن طُلب منك تأكيد البريد الإلكتروني، تحقق من بريدك ثم سجّل الدخول.')
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-14 h-14">
            <Logo size={56} />
          </div>
          <h1 className="text-[20px] font-black">
            <span className="bg-gradient-to-br from-pri to-sec bg-clip-text text-transparent">مُحلّل</span>
          </h1>
          <p className="text-t2 text-[13px] mt-1">
            {mode === 'signin' && 'سجّل الدخول لحسابك'}
            {mode === 'signup' && 'أنشئ حساباً جديداً'}
            {mode === 'forgot' && 'أدخل بريدك لإرسال رابط استعادة كلمة المرور'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-s1 border border-bd p-4">
          <label className="block text-[11px] text-t2 mb-1 font-bold">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-3 w-full"
          />
          {mode !== 'forgot' && (
            <>
              <label className="block text-[11px] text-t2 mb-1 font-bold">كلمة المرور</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mb-3 w-full"
              />
            </>
          )}

          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="block mb-3 text-[11px] font-bold text-t2"
            >
              نسيت كلمة المرور؟
            </button>
          )}

          {error && <p className="text-[12px] text-err font-bold mb-3">{error}</p>}
          {info && <p className="text-[12px] text-ok font-bold mb-3">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pri text-white font-extrabold text-[14px] disabled:opacity-40"
          >
            {loading
              ? 'جارٍ...'
              : mode === 'signin'
                ? 'تسجيل الدخول'
                : mode === 'signup'
                  ? 'إنشاء حساب'
                  : 'إرسال رابط الاستعادة'}
          </button>
        </form>

        {mode === 'forgot' ? (
          <button onClick={() => switchMode('signin')} className="w-full text-center mt-3 text-[12px] font-bold text-pri">
            العودة لتسجيل الدخول
          </button>
        ) : (
          <button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="w-full text-center mt-3 text-[12px] font-bold text-pri"
          >
            {mode === 'signin' ? 'ليس لديك حساب؟ أنشئ واحداً' : 'لديك حساب بالفعل؟ سجّل الدخول'}
          </button>
        )}
      </div>
    </div>
  )
}
