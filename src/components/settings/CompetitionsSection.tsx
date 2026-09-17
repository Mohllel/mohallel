import { useState } from 'react'
import { useClubStore } from '../../store/useClubStore'

export function CompetitionsSection() {
  const { competitions, addCompetitionPreset, removeCompetitionPreset } = useClubStore()
  const [name, setName] = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addCompetitionPreset(trimmed)
    setName('')
  }

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">🏆 المسابقات ({competitions.length})</div>

      {competitions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {competitions.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1.5 bg-bg border border-bd rounded-full pl-1.5 pr-3 py-1.5 text-[12px] font-bold"
            >
              {c.name}
              <button
                onClick={() => removeCompetitionPreset(c.id)}
                className="w-5 h-5 rounded-full bg-err/10 text-err text-[10px] flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="اسم المسابقة..."
          className="flex-1"
        />
        <button onClick={handleAdd} className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px]">
          +
        </button>
      </div>
    </div>
  )
}
