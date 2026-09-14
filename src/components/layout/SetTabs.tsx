import { useMatchesStore } from '../../store/useMatchesStore'

interface SetTabsProps {
  matchId: string
}

export function SetTabs({ matchId }: SetTabsProps) {
  const match = useMatchesStore((s) => s.matches[matchId])
  const setSet = useMatchesStore((s) => s.setSet)
  if (!match) return null

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const winner = match.setWinners[s - 1]
        return (
          <button
            key={s}
            onClick={() => setSet(matchId, s)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold border relative ${
              match.set === s ? 'bg-pri border-pri text-white' : 'border-bd text-t3'
            }`}
          >
            ش{s}
            {winner && <span className="absolute -top-1 -left-1 text-[8px]">{winner === 'A' ? '🟢' : '🔴'}</span>}
          </button>
        )
      })}
    </div>
  )
}
