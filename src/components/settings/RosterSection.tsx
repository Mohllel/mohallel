import { useState } from 'react'
import { useClubStore } from '../../store/useClubStore'
import { PlayerChip } from '../setup/PlayerChip'

export function RosterSection() {
  const { players, addPlayer, removePlayer, setPlayerPhoto, setPlayerNumber, setPlayerPosition, setPlayerBio } =
    useClubStore()
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addPlayer(trimmed, number === '' ? undefined : Number(number))
    setName('')
    setNumber('')
  }

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">👥 لاعبو الفريق ({players.length})</div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {players.map((p) => (
          <PlayerChip
            key={p.id}
            player={p}
            onRemove={() => removePlayer(p.id)}
            onPhoto={(d) => setPlayerPhoto(p.id, d)}
            onNumberChange={(n) => setPlayerNumber(p.id, n)}
            onPositionChange={(pos) => setPlayerPosition(p.id, pos)}
            onBioChange={(bio) => setPlayerBio(p.id, bio)}
          />
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          type="number"
          placeholder="#"
          className="w-14 text-center"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="اسم اللاعب..."
          className="flex-1"
        />
        <button onClick={handleAdd} className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px]">
          +
        </button>
      </div>
    </div>
  )
}
