import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMatchesStore } from '../../store/useMatchesStore'
import { Header } from '../layout/Header'
import { CourtMap } from '../court/CourtMap'
import type { Quality, SkillKey } from '../../types/domain'
import { GridMode } from './GridMode'
import { MatchControlBar } from './MatchControlBar'
import { ModeToggle } from './ModeToggle'
import { QualityPopup } from './QualityPopup'
import { QuickMode } from './QuickMode'
import { UndoBar } from './UndoBar'

interface PendingQuality {
  rect: DOMRect
  playerId: string
  skill: SkillKey
}

export function LiveScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const match = useMatchesStore((s) => (id ? s.matches[id] : undefined))
  const addAction = useMatchesStore((s) => s.addAction)
  const [pending, setPending] = useState<PendingQuality | null>(null)

  if (!id || !match) {
    return (
      <div className="p-6 text-center text-t3">
        <p className="mb-4">لم يتم العثور على هذه المباراة.</p>
        <button onClick={() => navigate('/')} className="text-pri font-bold">
          العودة للرئيسية
        </button>
      </div>
    )
  }

  const requestQuality = (rect: DOMRect, playerId: string, skill: SkillKey) => {
    setPending({ rect, playerId, skill })
  }
  const pickQuality = (q: Quality) => {
    if (!pending) return
    addAction(id, { side: 'A', playerId: pending.playerId, skill: pending.skill, quality: q })
    setPending(null)
  }

  return (
    <div>
      <Header matchId={id} />

      {match.status === 'finished' && (
        <div className="mx-3 mt-2 bg-ok/10 border border-ok/30 rounded-xl p-3 flex items-center justify-between">
          <span className="text-[12px] font-bold text-ok">🏁 انتهت المباراة</span>
          <button onClick={() => navigate(`/match/${id}/report`)} className="text-[12px] font-extrabold text-pri">
            عرض التقرير ←
          </button>
        </div>
      )}

      <ModeToggle matchId={id} />
      <MatchControlBar matchId={id} />

      {match.mode === 'grid' && <GridMode matchId={id} paused={!!match.paused} onRequestQuality={requestQuality} />}
      {match.mode === 'quick' && <QuickMode matchId={id} paused={!!match.paused} onRequestQuality={requestQuality} />}
      {match.mode === 'court' && <CourtMap matchId={id} paused={!!match.paused} />}

      {pending && (
        <QualityPopup anchorRect={pending.rect} onPick={pickQuality} onClose={() => setPending(null)} />
      )}

      <UndoBar matchId={id} />
    </div>
  )
}
