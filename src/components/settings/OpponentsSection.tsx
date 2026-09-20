import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'

export function OpponentsSection() {
  const { isPro, opponentRosters, addOpponentPlayer, removeOpponentPlayer } = useClubStore()
  const { clubs } = useReferenceDataStore()
  const [selected, setSelected] = useState<string | null>(null)

  const selectedClub = clubs.find((c) => c.id === selected) ?? null

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">🆚 الفرق المنافسة ({clubs.length})</div>

      {clubs.length === 0 ? (
        <p className="text-[12px] text-t3">لا توجد أندية مسجَّلة بعد.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {clubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelected(selected === club.id ? null : club.id)}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 ${
                selected === club.id ? 'bg-pri/10 border-pri' : 'bg-bg border-bd'
              }`}
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-s2 border border-bl overflow-hidden flex items-center justify-center text-pri font-black text-[13px]">
                {club.logo ? <img src={club.logo} alt="" className="w-full h-full object-cover" /> : '🆚'}
              </div>
              <span className="text-[12px] font-bold text-right leading-tight line-clamp-2">{club.name}</span>
            </button>
          ))}
        </div>
      )}

      {selectedClub && (
        <div className="bg-bg border border-bd rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex-1 text-[13px] font-bold">{selectedClub.name}</span>
            <Link to={`/scouting/${selectedClub.id}`} className="text-[11px] font-bold text-t2">
              📋 استطلاع
            </Link>
          </div>

          {isPro ? (
            <OpponentRosterEditor
              players={opponentRosters[selectedClub.id] ?? []}
              onAdd={(n, num) => addOpponentPlayer(selectedClub.id, n, num)}
              onRemove={(pid) => removeOpponentPlayer(selectedClub.id, pid)}
            />
          ) : (
            <p className="text-[10px] text-t3 pt-2 border-t border-bd mt-2">
              🔒 تسجيل أرقام لاعبي المنافس لتحليل نقاط قوته وضعفه متاح في النسخة المدفوعة.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface OpponentRosterEditorProps {
  players: { id: string; name: string; number?: number }[]
  onAdd: (name: string, number?: number) => void
  onRemove: (playerId: string) => void
}

function OpponentRosterEditor({ players, onAdd, onRemove }: OpponentRosterEditorProps) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, number === '' ? undefined : Number(number))
    setName('')
    setNumber('')
  }

  return (
    <div className="pt-2 border-t border-bd">
      {players.map((p) => (
        <div key={p.id} className="flex items-center gap-2 mb-1 text-[12px]">
          <span className="text-t3 w-8">#{p.number ?? '—'}</span>
          <span className="flex-1">{p.name}</span>
          <button onClick={() => onRemove(p.id)} className="text-err text-xs">
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-1.5 mt-1.5">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          type="number"
          placeholder="#"
          className="w-12 text-center text-[12px] py-1.5"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="اسم اللاعب..."
          className="flex-1 text-[12px] py-1.5"
        />
        <button onClick={handleAdd} className="px-3 bg-pri text-white rounded-lg font-extrabold text-[12px]">
          +
        </button>
      </div>
    </div>
  )
}
