import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { generateRecurringDates, WEEKDAYS } from '../../lib/recurringSchedule'
import type { SkillKey } from '../../types/domain'
import { Avatar } from '../shared/Avatar'
import { BackButton } from '../shared/BackButton'
import { SkillPicker } from './SkillPicker'

export function ScheduleTrainingScreen() {
  const navigate = useNavigate()
  const { players } = useClubStore()
  const { createScheduledSession } = useTrainingStore()

  const [skill, setSkill] = useState<SkillKey | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selected, setSelected] = useState<Set<string>>(new Set(players.map((p) => p.id)))
  const [recurring, setRecurring] = useState(false)
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set([new Date().getDay()]))
  const [weeks, setWeeks] = useState(4)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleWeekday = (v: number) => {
    setWeekdays((prev) => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      return next
    })
  }

  const dates = recurring ? generateRecurringDates(date, Array.from(weekdays), weeks) : [date]
  const canSchedule = skill !== null && selected.size >= 1 && dates.length >= 1

  const handleSchedule = () => {
    if (!skill || !canSchedule) return
    const playerIds = Array.from(selected)
    for (const d of dates) {
      createScheduledSession(skill, d, playerIds)
    }
    navigate('/training')
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <BackButton to="/training" />
        <h2 className="text-[18px] font-black flex-1">🗓 جدولة تمرين</h2>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <label className="block text-[11px] text-t2 mb-1.5 font-bold">اختر المهارة</label>
        <SkillPicker value={skill} onChange={setSkill} />
        <label className="block text-[11px] text-t2 mb-1 mt-3 font-bold">
          {recurring ? 'تاريخ البداية' : 'التاريخ'}
        </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[14px] font-extrabold">🔁 تكرار أسبوعي</span>
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="w-5 h-5"
          />
        </label>

        {recurring && (
          <div className="mt-3">
            <label className="block text-[11px] text-t2 mb-1.5 font-bold">أيام التكرار</label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {WEEKDAYS.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => toggleWeekday(w.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
                    weekdays.has(w.value) ? 'bg-pri text-white border-pri' : 'bg-bg border-bd text-t2'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <label className="block text-[11px] text-t2 mb-1 font-bold">لعدد أسابيع</label>
            <input
              type="number"
              min={1}
              max={12}
              value={weeks}
              onChange={(e) => setWeeks(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
              className="w-20 text-center"
            />
            <p className="text-[10px] text-t3 mt-2">
              {weekdays.size === 0
                ? 'اختر يوماً واحداً على الأقل.'
                : `سيُنشأ ${dates.length} تمريناً مجدولاً من ${date} حتى ${dates[dates.length - 1] ?? date}.`}
            </p>
          </div>
        )}
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">
          👥 المدعوّون ({selected.size}/{players.length})
        </div>
        <div className="grid grid-cols-3 gap-2">
          {players.map((p) => {
            const isSelected = selected.has(p.id)
            return (
              <label
                key={p.id}
                className={`flex flex-col items-center gap-1.5 border rounded-xl px-2 pt-3 pb-2 cursor-pointer ${
                  isSelected ? 'bg-pri/10 border-pri' : 'bg-bg border-bd opacity-50'
                }`}
              >
                <input type="checkbox" checked={isSelected} onChange={() => toggle(p.id)} className="hidden" />
                <Avatar name={p.name} photo={p.photo} size={48} />
                <span className="text-[11px] font-bold text-center leading-tight line-clamp-2">{p.name}</span>
              </label>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSchedule}
        disabled={!canSchedule}
        className="block w-full py-4 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[17px] font-black mt-2 disabled:opacity-40"
      >
        {recurring && dates.length > 1 ? `🗓 جدولة ${dates.length} تمارين` : '🗓 جدولة التمرين'}
      </button>
    </div>
  )
}
