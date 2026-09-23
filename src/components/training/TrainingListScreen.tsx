import { Link } from 'react-router-dom'
import { useTrainingStore } from '../../store/useTrainingStore'

export function TrainingListScreen() {
  const { sessions, deleteSession } = useTrainingStore()
  const all = Object.values(sessions)
  const scheduled = all.filter((s) => s.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))
  const done = all.filter((s) => s.status !== 'scheduled').sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">🏋️ التدريب</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Link
          to="/training/new"
          className="block text-center py-3.5 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[13px] font-black"
        >
          ▶ تمرين الآن
        </Link>
        <Link
          to="/training/schedule"
          className="block text-center py-3.5 bg-s1 border border-bd rounded-2xl text-[13px] font-black text-pri"
        >
          🗓 جدولة تمرين
        </Link>
      </div>

      <Link
        to="/training/progress"
        className="flex items-center justify-between bg-s1 border border-bd rounded-2xl p-3 mb-4 font-extrabold text-[13px]"
      >
        📈 تقدّم الأداء — تدريب مقابل مباراة
        <span className="text-t3">←</span>
      </Link>

      {scheduled.length > 0 && (
        <>
          <div className="text-[12px] font-extrabold text-t2 mb-2">المجدولة</div>
          {scheduled.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-s1 border border-bd rounded-2xl p-3 mb-2">
              <span className="w-1.5 self-stretch rounded-full bg-warn" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-extrabold truncate">{s.title}</div>
                <div className="text-[10px] text-t3">{s.date} · {s.playerIds.length} مدعوّ</div>
              </div>
              <Link
                to={`/training/${s.id}/start`}
                className="px-3 py-1.5 bg-ok text-white rounded-lg text-[11px] font-extrabold shrink-0"
              >
                ▶ ابدأ الآن
              </Link>
              <button
                onClick={() => confirm('إلغاء هذا التمرين المجدول؟') && deleteSession(s.id)}
                className="w-7 h-7 rounded bg-err/10 text-err text-xs flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </>
      )}

      <div className="text-[12px] font-extrabold text-t2 mb-2 mt-1">السجل</div>
      {done.length === 0 ? (
        <p className="text-center text-t3 text-[13px] mt-6">لا توجد تمارين مسجَّلة بعد.</p>
      ) : (
        done.map((s) => {
          const attendedCount = s.attendedPlayerIds?.length ?? s.playerIds.length
          return (
            <Link key={s.id} to={`/training/${s.id}`} className="block bg-s1 border border-bd rounded-2xl p-3 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-extrabold">{s.title}</span>
                <span className="text-[11px] text-t3">{s.date}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-t3">
                <span>
                  {attendedCount}/{s.playerIds.length} حضروا
                </span>
                <span>{s.reps.length} تكرار مسجَّل</span>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
