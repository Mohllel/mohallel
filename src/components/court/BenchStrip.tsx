import type { Player } from '../../types/domain'

interface BenchStripProps {
  players: Player[]
  selectedId: string | null
  onSelect: (playerId: string) => void
  variant: 'own' | 'opponent'
}

/** شريط الاحتياط فوق كل ملعب — نقرة تختار اللاعب تمهيداً لتبديله مكان لاعب في الملعب */
export function BenchStrip({ players, selectedId, onSelect, variant }: BenchStripProps) {
  if (players.length === 0) {
    return <div className="h-9 flex items-center justify-center text-[9px] text-t3">لا يوجد احتياط</div>
  }

  const selectedClass = variant === 'own' ? 'bg-pri border-pri text-white' : 'bg-err border-err text-white'

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 px-0.5" style={{ scrollbarWidth: 'none' }}>
      {players.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black border-2 ${
            selectedId === p.id ? selectedClass : 'bg-s1 border-bd text-t2'
          }`}
        >
          {p.number ?? '—'}
        </button>
      ))}
    </div>
  )
}
