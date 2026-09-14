import { useEffect, useState } from 'react'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { isCloudEnabled } from '../../lib/supabase'
import { pushLiveMatch } from '../../lib/liveShare'

interface LiveShareButtonProps {
  matchId: string
}

export function LiveShareButton({ matchId }: LiveShareButtonProps) {
  const match = useMatchesStore((s) => s.matches[matchId])
  const setLiveShareEnabled = useMatchesStore((s) => s.setLiveShareEnabled)
  const { clubName, clubLogo } = useClubStore()
  const [showPanel, setShowPanel] = useState(false)
  const [copied, setCopied] = useState(false)

  const enabled = !!match?.liveShareEnabled

  useEffect(() => {
    if (!match || !enabled || !isCloudEnabled) return
    pushLiveMatch(match, clubName, clubLogo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, match?.sA, match?.sB, match?.set, match?.setWinners, match?.status, match?.servingSide])

  if (!match) return null

  const shareUrl = `${window.location.origin}/live/${matchId}`

  const toggle = () => {
    if (!isCloudEnabled) return
    const next = !enabled
    setLiveShareEnabled(matchId, next)
    if (next) {
      pushLiveMatch(match, clubName, clubLogo)
      setShowPanel(true)
    } else {
      setShowPanel(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard قد يكون غير متاح — الرابط ظاهر للنسخ يدوياً */
    }
  }

  return (
    <>
      <button
        onClick={enabled ? () => setShowPanel(true) : toggle}
        disabled={!isCloudEnabled}
        title={!isCloudEnabled ? 'البث المباشر غير مُفعَّل (يتطلب إعداد سحابي)' : undefined}
        className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[15px] ${
          enabled ? 'bg-err text-white animate-pulse' : 'bg-s2 border border-bd text-t2'
        } disabled:opacity-30`}
      >
        📡
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={() => setShowPanel(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-s1 border border-bd rounded-2xl p-4 w-80">
            <div className="text-[14px] font-extrabold mb-3">📡 البث المباشر للنتيجة</div>

            {enabled ? (
              <>
                <p className="text-[11px] text-t3 mb-2">شارك هذا الرابط مع أهالي اللاعبين لمتابعة النتيجة لحظياً — بلا تسجيل دخول:</p>
                <div className="bg-bg border border-bd rounded-lg p-2 mb-3 text-[11px] break-all" dir="ltr">
                  {shareUrl}
                </div>
                <button onClick={copyLink} className="w-full py-2.5 bg-pri text-white rounded-xl font-extrabold text-[13px] mb-2">
                  {copied ? '✅ تم النسخ' : '📋 نسخ الرابط'}
                </button>
                <button
                  onClick={() => {
                    setLiveShareEnabled(matchId, false)
                    setShowPanel(false)
                  }}
                  className="w-full py-2.5 bg-err text-white rounded-xl font-extrabold text-[13px]"
                >
                  إيقاف البث
                </button>
              </>
            ) : (
              <p className="text-[11px] text-t3">البث متوقف حالياً.</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
