import { useState } from 'react'
import { Logo } from '../brand/Logo'
import { useAuthStore } from '../../store/useAuthStore'

/** تُعرض بدل التطبيق مباشرة بعد فتح رابط استعادة كلمة المرور من البريد — تفرض تعيين كلمة مرور جديدة أولاً */
export function ResetPasswordScreen() {
  const { updatePassword, signOut } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }
    setLoading(true)
    const err = await updatePassword(password)
    setLoading(false)
    if (err) setError(err)
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
          <p className="text-t2 text-[13px] mt-1">عيّن كلمة مرور جديدة لحسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-s1 border border-bd p-4">
          <label className="block text-[11px] text-t2 mb-1 font-bold">كلمة المرور الجديدة</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-3 w-full"
          />
          <label className="block text-[11px] text-t2 mb-1 font-bold">تأكيد كلمة المرور</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="mb-3 w-full"
          />

          {error && <p className="text-[12px] text-err font-bold mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pri text-white font-extrabold text-[14px] disabled:opacity-40"
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>

        <button onClick={signOut} className="w-full text-center mt-3 text-[12px] font-bold text-t2">
          إلغاء والعودة لتسجيل الدخول
        </button>
      </div>
    </div>
  )
}
