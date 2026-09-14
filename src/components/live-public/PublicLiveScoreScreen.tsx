import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { fetchLiveMatch, subscribeLiveMatch, type LiveMatchView } from '../../lib/liveShare'
import { isCloudEnabled } from '../../lib/supabase'

export function PublicLiveScoreScreen() {
  const { matchId } = useParams<{ matchId: string }>()
  const [view, setView] = useState<LiveMatchView | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    let unsubscribe = () => {}
    fetchLiveMatch(matchId).then((v) => {
      setView(v)
      setLoading(false)
    })
    unsubscribe = subscribeLiveMatch(matchId, setView)
    return unsubscribe
  }, [matchId])

  if (!isCloudEnabled) {
    return (
      <Centered>
        <p className="text-t3 text-[13px]">البث المباشر غير مُفعَّل حالياً بهذا التطبيق.</p>
      </Centered>
    )
  }

  if (loading) {
    return (
      <Centered>
        <p className="text-t3 text-[13px]">جارٍ التحميل…</p>
      </Centered>
    )
  }

  if (!view) {
    return (
      <Centered>
        <p className="text-t3 text-[13px]">هذه المباراة غير متاحة للبث المباشر حالياً.</p>
      </Centered>
    )
  }

  const idx = view.set - 1
  const setScores = [0, 1, 2, 3, 4].filter((i) => view.setWinners[i] || view.sA[i] || view.sB[i])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-bg">
      <div className="flex items-center gap-2 mb-8">
        <Logo size={32} />
        <span className="text-[16px] font-black text-pri">مُحلّل</span>
        {view.status === 'live' && (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-err mr-2">
            <span className="w-2 h-2 rounded-full bg-err animate-pulse" /> مباشر
          </span>
        )}
      </div>

      <div className="w-full max-w-sm bg-s1 border border-bd rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <TeamBlock name={view.clubName} logo={view.clubLogo} serving={view.servingSide === 'A'} />
          <span className="text-[13px] text-t3 font-bold">شوط {view.set}</span>
          <TeamBlock name={view.opponentName} logo={view.opponentLogo} serving={view.servingSide === 'B'} />
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <span className="text-[56px] font-black text-t1">{view.sA[idx]}</span>
          <span className="text-[32px] text-t3 font-thin">:</span>
          <span className="text-[56px] font-black text-t1">{view.sB[idx]}</span>
        </div>

        {setScores.length > 0 && (
          <div className="flex justify-center gap-1.5 flex-wrap mt-2">
            {setScores.map((i) => (
              <span key={i} className="bg-bg px-2 py-1 rounded-md text-[11px] font-bold text-t2">
                {view.sA[i]}:{view.sB[i]}
              </span>
            ))}
          </div>
        )}

        {view.status === 'finished' && (
          <p className="text-center text-[12px] font-extrabold text-ok mt-4">🏁 انتهت المباراة</p>
        )}
      </div>

      <p className="text-[10px] text-t3 mt-6">تحدَّث النتيجة تلقائياً لحظياً</p>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh flex items-center justify-center bg-bg p-6">{children}</div>
}

function TeamBlock({ name, logo, serving }: { name: string; logo: string | null; serving: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-24">
      <div className="relative w-12 h-12 rounded-xl bg-s2 border border-bl overflow-hidden flex items-center justify-center text-pri font-black">
        {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : name.substring(0, 2)}
        {serving && <span className="absolute -top-1 -left-1 text-[12px]">🏐</span>}
      </div>
      <span className="text-[11px] font-bold text-center truncate w-full">{name}</span>
    </div>
  )
}
