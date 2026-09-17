import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { LogoUpload } from '../shared/LogoUpload'

export function OpponentsSection() {
  const {
    opponentPresets,
    isPro,
    addOpponentPreset,
    removeOpponentPreset,
    setOpponentPresetLogo,
    opponentRosters,
    addOpponentPlayer,
    removeOpponentPlayer,
  } = useClubStore()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addOpponentPreset(trimmed)
    setName('')
  }

  const selectedPreset = opponentPresets.find((p) => p.id === selected) ?? null

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">🆚 الفرق المنافسة ({opponentPresets.length})</div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {opponentPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelected(selected === preset.id ? null : preset.id)}
            className={`flex flex-col items-center gap-1.5 border rounded-xl px-2 pt-3 pb-2 ${
              selected === preset.id ? 'bg-pri/10 border-pri' : 'bg-bg border-bd'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-s2 border border-bl overflow-hidden flex items-center justify-center text-pri font-black text-lg">
              {preset.logo ? <img src={preset.logo} alt="" className="w-full h-full object-cover" /> : '🆚'}
            </div>
            <span className="text-[12px] font-bold text-center leading-tight line-clamp-2">{preset.name}</span>
          </button>
        ))}
      </div>

      {selectedPreset && (
        <div className="bg-bg border border-bd rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <LogoUpload
              value={selectedPreset.logo}
              onChange={(d) => setOpponentPresetLogo(selectedPreset.id, d)}
              path={`opponents/${selectedPreset.id}`}
              size={40}
            />
            <span className="flex-1 text-[13px] font-bold">{selectedPreset.name}</span>
            <Link to={`/scouting/${selectedPreset.id}`} className="text-[11px] font-bold text-t2">
              📋 استطلاع
            </Link>
            <button
              onClick={() => {
                removeOpponentPreset(selectedPreset.id)
                setSelected(null)
              }}
              className="w-7 h-7 rounded bg-err/10 text-err text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {isPro ? (
            <OpponentRosterEditor
              presetId={selectedPreset.id}
              players={opponentRosters[selectedPreset.id] ?? []}
              onAdd={(n, num) => addOpponentPlayer(selectedPreset.id, n, num)}
              onRemove={(pid) => removeOpponentPlayer(selectedPreset.id, pid)}
            />
          ) : (
            <p className="text-[10px] text-t3 pt-2 border-t border-bd mt-2">
              🔒 تسجيل أرقام لاعبي المنافس لتحليل نقاط قوته وضعفه متاح في النسخة المدفوعة.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-1.5 mt-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="اسم فريق منافس..."
          className="flex-1"
        />
        <button onClick={handleAdd} className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px]">
          +
        </button>
      </div>
    </div>
  )
}

interface OpponentRosterEditorProps {
  presetId: string
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
