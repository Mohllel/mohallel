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
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addOpponentPreset(trimmed)
    setName('')
  }

  return (
    <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
      <div className="text-[14px] font-extrabold mb-3">🆚 الفرق المنافسة ({opponentPresets.length})</div>
      {opponentPresets.map((preset) => {
        const roster = opponentRosters[preset.id] ?? []
        return (
          <div key={preset.id} className="bg-bg border border-bd rounded-xl p-2.5 mb-1.5">
            <div className="flex items-center gap-2">
              <LogoUpload value={preset.logo} onChange={(d) => setOpponentPresetLogo(preset.id, d)} size={32} />
              <span className="flex-1 text-[13px] font-bold">{preset.name}</span>
              <Link to={`/scouting/${preset.id}`} className="text-[11px] font-bold text-t2">
                📋 استطلاع
              </Link>
              <button
                onClick={() => setExpanded(expanded === preset.id ? null : preset.id)}
                className="text-[11px] text-pri font-bold"
              >
                {isPro ? (expanded === preset.id ? 'إخفاء اللاعبين' : 'أرقام اللاعبين') : '🔒 PRO'}
              </button>
              <button
                onClick={() => removeOpponentPreset(preset.id)}
                className="w-6 h-6 rounded-full bg-err/10 text-err text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {isPro && expanded === preset.id && (
              <OpponentRosterEditor
                presetId={preset.id}
                players={roster}
                onAdd={(n, num) => addOpponentPlayer(preset.id, n, num)}
                onRemove={(pid) => removeOpponentPlayer(preset.id, pid)}
              />
            )}
          </div>
        )
      })}
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
      {!isPro && (
        <p className="text-[10px] text-t3 mt-2">
          🔒 تسجيل أرقام لاعبي المنافس لتحليل نقاط قوته وضعفه متاح في النسخة المدفوعة.
        </p>
      )}
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
    <div className="mt-2 pt-2 border-t border-bd">
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
