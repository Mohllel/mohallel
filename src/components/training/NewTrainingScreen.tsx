import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { Avatar } from '../shared/Avatar'
import { BackButton } from '../shared/BackButton'
import { TrainingTemplateChips } from './TrainingTemplateChips'

export function NewTrainingScreen() {
  const navigate = useNavigate()
  const { players } = useClubStore()
  const { createSession } = useTrainingStore()

  const [title, setTitle] = useState('')
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

  const canStart = title.trim().length > 0 && selected.size >= 1

  const handleStart = () => {
    if (!canStart) return
    const id = createSession(title.trim(), date, Array.from(selected))
    navigate(`/training/${id}`)
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <BackButton />
        <h2 className="text-[18px] font-black flex-1">🏋️ تمرين جديد</h2>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <label className="block text-[11px] text-t2 mb-1 font-bold">عنوان التمرين</label>
        <TrainingTemplateChips onPick={setTitle} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تمرين استقبال" className="mb-3" />
        <label className="block text-[11px] text-t2 mb-1 font-bold">التاريخ</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">
          👥 المشاركون ({selected.size}/{players.length})
        </div>
        {players.map((p) => (
          <label
            key={p.id}
            className="flex items-center gap-2.5 bg-bg border border-bd rounded-xl px-2.5 py-2 mb-1.5 cursor-pointer"
          >
            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="w-4 h-4" />
            <Avatar name={p.name} photo={p.photo} size={28} />
            <span className="flex-1 text-[13px] font-bold">{p.name}</span>
          </label>
        ))}
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
