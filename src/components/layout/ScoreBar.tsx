import { useMatchesStore } from '../../store/useMatchesStore'

interface ScoreBarProps {
  matchId: string
}

export function ScoreBar({ matchId }: ScoreBarProps) {
  const match = useMatchesStore((s) => s.matches[matchId])
  const bumpScore = useMatchesStore((s) => s.bumpScore)
  if (!match) return null
  const idx = match.set - 1

  return (
    <div className="flex items-center justify-center gap-3 pb-1.5">
      <Side
        score={match.sA[idx]}
        onMinus={() => bumpScore(matchId, 'A', -1)}
        onPlus={() => bumpScore(matchId, 'A', 1)}
      />
      <span className="text-xl text-t3 font-thin">:</span>
      <Side
        score={match.sB[idx]}
        onMinus={() => bumpScore(matchId, 'B', -1)}
        onPlus={() => bumpScore(matchId, 'B', 1)}
      />
    </div>
  )
}

function Side({ score, onMinus, onPlus }: { score: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onMinus} className="w-7 h-7 rounded-lg bg-s2 border border-bd text-t2 text-base font-bold flex items-center justify-center">
        −
      </button>
      <span className="text-2xl font-black min-w-[30px] text-center">{score}</span>
      <button onClick={onPlus} className="w-7 h-7 rounded-lg bg-ok text-white text-base font-bold flex items-center justify-center">
        +
      </button>
    </div>
  )
}
