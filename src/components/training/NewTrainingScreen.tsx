import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import type { SkillKey } from '../../types/domain'
import { Avatar } from '../shared/Avatar'
import { BackButton } from '../shared/BackButton'
import { SkillPicker } from './SkillPicker'

export function NewTrainingScreen() {
  const navigate = useNavigate()
  const { players } = useClubStore()
  const { createSession } = useTrainingStore()

  const [skill, setSkill] = useState<SkillKey | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selected, setSelected] = useState<Set<string>>(new Set(players.map((p) => p.id)))

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const canStart = skill !== null && selected.size >= 1

  const handleStart = () => {
    if (!skill || !canStart) return
    const id = createSession(skill, date, Array.from(selected))
    navigate(`/training/${id}`)
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <BackButton />
        <h2 className="text-[18px] font-black flex-1">🏋️ تمرين جديد</h2>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <label className="block text-[11px] text-t2 mb-1.5 font-bold">اختر المهارة</label>
        <SkillPicker value={skill} onChange={setSkill} />
        <label className="block text-[11px] text-t2 mb-1 mt-3 font-bold">التاريخ</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">
          👥 المشاركون ({selected.size}/{players.length})
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
        onClick={handleStart}
        disabled={!canStart}
        className="block w-full py-4 bg-gradient-to-br from-ok to-[#059669] text-white rounded-2xl text-[17px] font-black mt-2 disabled:opacity-40"
      >
        ▶ بدء التمرين
      </button>
    </div>
  )
}
