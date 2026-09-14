import { createRef, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useMatchPlayers } from '../../lib/useMatchPlayers'
import { countSetWins } from '../../lib/scoring'
import { buildAndDownloadReportPdf, downloadElementAsPng } from '../../lib/export/pdf'
import type { ReportView } from '../../types/domain'
import { Infographic } from './Infographic'
import { OverviewTab } from './OverviewTab'
import { PdfExportLayer } from './pdf/PdfExportLayer'
import { PlayerDetailTab } from './PlayerDetailTab'
import { VideoLinkPanel } from './video/VideoLinkPanel'

export function ReportScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const match = useMatchesStore((s) => (id ? s.matches[id] : undefined))
  const players = useMatchPlayers(id ?? '')
  const { clubName, clubLogo } = useClubStore()

  const [rv, setRv] = useState<ReportView>('overview')
  const [rp, setRp] = useState<string | null>(null)
  const [showInfographic, setShowInfographic] = useState(false)
  const [exporting, setExporting] = useState(false)

  const infographicRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playerRefs = useMemo(() => players.map(() => createRef<HTMLDivElement>()), [players.map((p) => p.id).join(',')])

  if (!id || !match) {
    return (
      <div className="p-6 text-center text-t3">
        <p className="mb-4">لم يتم العثور على هذه المباراة.</p>
        <button onClick={() => navigate('/reports')} className="text-pri font-bold">
          العودة للتقارير
        </button>
      </div>
    )
  }

  const scores = [0, 1, 2, 3, 4].map((i) => (
    <span key={i} className="bg-bg px-2 py-0.5 rounded-md text-[12px] font-bold text-t2 mx-0.5">
      {match.sA[i]}:{match.sB[i]}
    </span>
  ))
  const setsA = countSetWins(match.setWinners, 'A')
  const setsB = countSetWins(match.setWinners, 'B')

  const handleDownloadPdf = async () => {
    if (!coverRef.current) return
    const playerEls = playerRefs.map((r) => r.current).filter((el): el is HTMLDivElement => el != null)
    if (playerEls.length !== players.length) return
    setExporting(true)
    try {
      await buildAndDownloadReportPdf({
        coverEl: coverRef.current,
        playerEls,
        filename: `مُحلّل-${match.opponentName}-${match.date}.pdf`,
      })
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadInfographic = async () => {
    if (!infographicRef.current) return
    await downloadElementAsPng(infographicRef.current, `مُحلّل-انفوجرافيك-${match.opponentName}.png`)
  }

  return (
    <div className="p-3 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-[34px] h-[34px] rounded-[10px] bg-s2 border border-bd text-t2 flex items-center justify-center"
        >
          ←
        </button>
        <h2 className="text-[18px] font-black flex-1">التقرير</h2>
        <button
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="px-3 py-2 bg-s2 border border-bd rounded-lg text-[11px] font-bold text-t2 disabled:opacity-50"
        >
          ⬇ تحميل
        </button>
        <button
          onClick={() => setShowInfographic(true)}
          className="px-3 py-2 bg-s2 border border-bd rounded-lg text-[11px] font-bold text-sec"
        >
          🖼 انفوجرافيك
        </button>
      </div>

      <div className="bg-bg">
        <div className="flex items-center justify-between bg-s1 border border-bd rounded-2xl p-3 mb-3">
          <span className="text-[13px] font-extrabold">{clubName || 'فريقك'}</span>
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-black text-pri mb-1">
              {setsA} : {setsB}
            </span>
            <div>{scores}</div>
          </div>
          <span className="text-[13px] font-extrabold">{match.opponentName || 'ب'}</span>
        </div>

        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => {
              setRv('overview')
              setRp(null)
            }}
            className={`flex-1 py-2.5 rounded-[10px] text-[12px] font-extrabold text-center border ${
              rv === 'overview' ? 'bg-pri border-pri text-white' : 'bg-s1 border-bd text-t3'
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => {
              setRv('player')
              setRp(null)
            }}
            className={`flex-1 py-2.5 rounded-[10px] text-[12px] font-extrabold text-center border ${
              rv === 'player' ? 'bg-pri border-pri text-white' : 'bg-s1 border-bd text-t3'
            }`}
          >
            تفاصيل
          </button>
          <button
            onClick={() => setRv('video')}
            className={`flex-1 py-2.5 rounded-[10px] text-[12px] font-extrabold text-center border ${
              rv === 'video' ? 'bg-pri border-pri text-white' : 'bg-s1 border-bd text-t3'
            }`}
          >
            🎬 الفيديو
          </button>
        </div>

        {rv === 'overview' && (
          <OverviewTab players={players} actions={match.act} onSelectPlayer={(pid) => setRp(pid)} />
        )}

        {rv === 'player' && !rp && (
          <>
            {players.map((p) => (
              <div
                key={p.id}
                onClick={() => setRp(p.id)}
                className="bg-s1 border border-bd rounded-2xl p-3 mb-2 cursor-pointer flex justify-between items-center"
              >
                <span className="text-[14px] font-extrabold">{p.name}</span>
                <span className="text-[11px] text-t3">
                  {match.act.filter((a) => a.playerId === p.id).length} إجراء
                </span>
              </div>
            ))}
          </>
        )}

        {rv === 'player' && rp && (
          <PlayerDetailTab
            player={players.find((p) => p.id === rp)!}
            actions={match.act}
            onBack={() => setRp(null)}
          />
        )}

        {rv === 'video' && <VideoLinkPanel matchId={id} match={match} />}
      </div>

      <PdfExportLayer
        match={match}
        players={players}
        actions={match.act}
        clubName={clubName}
        clubLogo={clubLogo}
        coverRef={coverRef}
        playerRefs={playerRefs}
      />

      {showInfographic && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex flex-col items-center justify-center gap-4 p-4"
          onClick={() => setShowInfographic(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="rounded-2xl overflow-hidden shadow-2xl scale-[0.85] sm:scale-100">
            <Infographic ref={infographicRef} match={match} players={players} clubName={clubName} clubLogo={clubLogo} actions={match.act} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadInfographic} className="px-5 py-2.5 bg-ok text-white rounded-xl font-extrabold text-[13px]">
              ⬇ تنزيل الصورة
            </button>
            <button onClick={() => setShowInfographic(false)} className="px-5 py-2.5 bg-s2 border border-bd rounded-xl font-bold text-[13px]">
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
