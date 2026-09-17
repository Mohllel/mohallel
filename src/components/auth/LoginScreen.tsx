import { useState } from 'react'
import { Logo } from '../brand/Logo'
import { useAuthStore } from '../../store/useAuthStore'

export function LoginScreen() {
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
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
            {mode === 'signin' ? 'سجّل الدخول لحسابك' : 'أنشئ حساباً جديداً'}
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

          {error && <p className="text-[12px] text-err font-bold mb-3">{error}</p>}
          {info && <p className="text-[12px] text-ok font-bold mb-3">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pri text-white font-extrabold text-[14px] disabled:opacity-40"
          >
            {loading ? 'جارٍ...' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setInfo(null)
          }}
          className="w-full text-center mt-3 text-[12px] font-bold text-pri"
        >
          {mode === 'signin' ? 'ليس لديك حساب؟ أنشئ واحداً' : 'لديك حساب بالفعل؟ سجّل الدخول'}
        </button>
      </div>
    </div>
  )
}
