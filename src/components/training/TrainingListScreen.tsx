import { Link } from 'react-router-dom'
import { useTrainingStore } from '../../store/useTrainingStore'

export function TrainingListScreen() {
  const { sessions } = useTrainingStore()
  const list = Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">🏋️ التدريب</h2>

      <Link
        to="/training/new"
        className="block text-center py-4 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[15px] font-black mb-4"
      >
        ▶ تمرين جديد
      </Link>

      {list.length === 0 ? (
        <p className="text-center text-t3 text-[13px] mt-10">لا توجد تمارين مسجَّلة بعد.</p>
      ) : (
        list.map((s) => (
          <Link key={s.id} to={`/training/${s.id}`} className="block bg-s1 border border-bd rounded-2xl p-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-extrabold">{s.title}</span>
              <span className="text-[11px] text-t3">{s.date}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-t3">
              <span>{s.playerIds.length} لاعب</span>
              <span>{s.reps.length} تكرار مسجَّل</span>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
