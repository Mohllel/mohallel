import { useState } from 'react'
import { useMatchesStore } from '../../../store/useMatchesStore'
import { useMatchPlayers } from '../../../lib/useMatchPlayers'
import type { Match } from '../../../types/domain'
import { ActionTimeline } from './ActionTimeline'
import { VideoPlayerModal } from './VideoPlayerModal'

interface VideoLinkPanelProps {
  matchId: string
  match: Match
}

export function VideoLinkPanel({ matchId, match }: VideoLinkPanelProps) {
  const { setMatchVideoUrl, calibrateMatchVideo, clearMatchVideoCalibration } = useMatchesStore()
  const players = useMatchPlayers(matchId)
  const [urlInput, setUrlInput] = useState(match.videoUrl ?? '')
  const [editingUrl, setEditingUrl] = useState(!match.videoUrl)
  const [playingOffset, setPlayingOffset] = useState<number | null>(null)

  const saveUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    setMatchVideoUrl(matchId, trimmed)
    setEditingUrl(false)
  }

  return (
    <div>
      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-2">🎬 فيديو المباراة</div>
        {editingUrl ? (
          <div className="flex gap-1.5">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="رابط يوتيوب أو رابط فيديو مباشر"
              className="flex-1"
            />
            <button onClick={saveUrl} className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px]">
              حفظ
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex-1 text-[11px] text-t2 truncate" dir="ltr">
              {match.videoUrl}
            </span>
            <button
              onClick={() => setEditingUrl(true)}
              className="px-3 py-1.5 bg-s2 border border-bd rounded-lg text-[11px] font-bold text-t2"
            >
              تغيير
            </button>
          </div>
        )}

        {match.videoUrl && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-bd">
            <span className="text-[11px] text-t2">
              {match.videoStartedAt != null ? '✅ الفيديو مضبوط على توقيت الإجراءات' : '⚠ لم يُضبط توقيت الفيديو بعد'}
            </span>
            {match.videoStartedAt != null && (
              <button
                onClick={() => clearMatchVideoCalibration(matchId)}
                className="text-[11px] font-bold text-err"
              >
                إعادة الضبط
              </button>
            )}
          </div>
        )}
      </div>

      {match.videoUrl && (
        <ActionTimeline
          match={match}
          players={players}
          onPlay={setPlayingOffset}
          onCalibrate={(referenceTs, seconds) => calibrateMatchVideo(matchId, referenceTs, seconds)}
        />
      )}

      {playingOffset != null && match.videoUrl && (
        <VideoPlayerModal videoUrl={match.videoUrl} offsetSeconds={playingOffset} onClose={() => setPlayingOffset(null)} />
      )}
    </div>
  )
}
