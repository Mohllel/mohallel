import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useTrainingStore } from '../../store/useTrainingStore'

const CONFIRM_WORD = 'حذف'

/** منطقة خطر بالإعدادات — تمسح كل بيانات الحساب (النادي، اللاعبون، المباريات، التدريبات) نهائياً وبلا رجعة */
export function DangerZoneSection() {
  const navigate = useNavigate()
  const { user, activeClubId } = useAuthStore()
  const resetClub = useClubStore((s) => s.resetClub)
  const clearAllMatches = useMatchesStore((s) => s.clearAllMatches)
  const clearAllSessions = useTrainingStore((s) => s.clearAllSessions)

  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  /** أثناء العمل كعضو مدعوّ على نادي شخص آخر، لا يجوز السماح بمسح بيانات ذلك النادي — الحذف متاح فقط على نادي المستخدم نفسه */
  const isOwnClub = activeClubId === null || activeClubId === user?.id
  if (!isOwnClub) {
    return (
      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold text-t2 mb-1">⚠ منطقة الخطر</div>
        <p className="text-[10px] text-t3">
          🔒 إعادة التعيين متاحة فقط عند العمل على ناديك الخاص — بدّل إلى "ناديك أنت" أعلاه أولاً.
        </p>
      </div>
    )
  }

  const handleReset = () => {
    clearAllMatches()
    clearAllSessions()
    resetClub()
    setOpen(false)
    setConfirmText('')
    navigate('/')
  }

  return (
    <div className="bg-s1 border border-err/40 rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold text-err mb-1">⚠ منطقة الخطر</div>
      <p className="text-[10px] text-t3 mb-3">
        يمسح هذا كل بيانات حسابك — اسم النادي، الشعار، اللاعبون، كل المباريات وتقاريرها، وكل جلسات التدريب — نهائياً
        وبلا إمكانية استرجاع.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 bg-err/10 text-err rounded-xl font-extrabold text-[13px]"
      >
        🗑 إعادة التعيين — مسح جميع البيانات
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60"
          onClick={() => {
            setOpen(false)
            setConfirmText('')
          }}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-s1 border border-bd rounded-2xl p-4 w-80">
            <div className="text-[14px] font-extrabold text-err mb-2">تأكيد إعادة التعيين</div>
            <p className="text-[11px] text-t2 mb-3">
              هذا الإجراء نهائي ولا يمكن التراجع عنه. لتأكيد المسح، اكتب كلمة{' '}
              <span className="font-black text-err">"{CONFIRM_WORD}"</span> بالحقل أدناه.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoFocus
              className="mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOpen(false)
                  setConfirmText('')
                }}
                className="flex-1 py-3 bg-s2 border border-bd rounded-xl font-extrabold text-[13px] text-t2"
              >
                إلغاء
              </button>
              <button
                onClick={handleReset}
                disabled={confirmText.trim() !== CONFIRM_WORD}
                className="flex-1 py-3 bg-err text-white rounded-xl font-extrabold text-[13px] disabled:opacity-40"
              >
                مسح نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
