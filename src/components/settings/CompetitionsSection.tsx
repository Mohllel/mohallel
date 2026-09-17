import { useState } from 'react'
import { useClubStore } from '../../store/useClubStore'

export function CompetitionsSection() {
  const { competitions, opponentPresets, addCompetitionPreset, removeCompetitionPreset, toggleCompetitionOpponent } =
    useClubStore()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addCompetitionPreset(trimmed)
    setName('')
  }

  const selectedCompetition = competitions.find((c) => c.id === selected) ?? null

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">🏆 المسابقات ({competitions.length})</div>

      {competitions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {competitions.map((c) => (
            <span
              key={c.id}
              className={`flex items-center gap-1.5 border rounded-full pl-1.5 pr-3 py-1.5 text-[12px] font-bold ${
                selected === c.id ? 'bg-pri/10 border-pri' : 'bg-bg border-bd'
              }`}
            >
              <button onClick={() => setSelected(selected === c.id ? null : c.id)}>{c.name}</button>
              <button
                onClick={() => {
                  removeCompetitionPreset(c.id)
                  if (selected === c.id) setSelected(null)
                }}
                className="w-5 h-5 rounded-full bg-err/10 text-err text-[10px] flex items-center justify-center"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {selectedCompetition && (
        <div className="bg-bg border border-bd rounded-xl p-3 mb-3">
          <div className="text-[12px] font-bold mb-2">
            الأندية المشاركة في «{selectedCompetition.name}» — بلا تحديد يعني بلا حصر (تظهر لأي منافس)
          </div>
          {opponentPresets.length === 0 ? (
            <p className="text-[11px] text-t3">أضف أندية أولاً في «الفرق المنافسة» بالأسفل.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {opponentPresets.map((p) => {
                const active = selectedCompetition.eligibleOpponentIds?.includes(p.id) ?? false
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleCompetitionOpponent(selectedCompetition.id, p.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
                      active ? 'bg-ok/15 border-ok text-ok' : 'bg-s1 border-bd text-t2'
                    }`}
                  >
                    {active ? '✓ ' : ''}
                    {p.name}
                  </button>
                )
              })}
            </div>
          )}
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
