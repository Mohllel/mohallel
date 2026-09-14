import { useEffect, useRef, useState } from 'react'
import { isYouTubeUrl, parseYouTubeId } from '../../../lib/video'

interface VideoPlayerModalProps {
  videoUrl: string
  offsetSeconds: number
  onClose: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string
          playerVars?: Record<string, unknown>
          events?: { onReady?: (e: { target: YouTubePlayerLike }) => void }
        },
      ) => YouTubePlayerLike
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YouTubePlayerLike {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  destroy: () => void
}

let youTubeApiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (youTubeApiPromise) return youTubeApiPromise
  youTubeApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return youTubeApiPromise
}

export function VideoPlayerModal({ videoUrl, offsetSeconds, onClose }: VideoPlayerModalProps) {
  const isYouTube = isYouTubeUrl(videoUrl)
  const youTubeId = isYouTube ? parseYouTubeId(videoUrl) : null
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isYouTube || !youTubeId || !containerRef.current) return
    let cancelled = false
    let player: YouTubePlayerLike | null = null

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return
      player = new window.YT.Player(containerRef.current, {
        videoId: youTubeId,
        playerVars: { start: Math.floor(offsetSeconds), autoplay: 1 },
        events: {
          onReady: (e) => {
            e.target.seekTo(offsetSeconds, true)
            e.target.playVideo()
            setReady(true)
          },
        },
      })
    })

    return () => {
      cancelled = true
      player?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youTubeId, offsetSeconds])

  useEffect(() => {
    if (isYouTube) return
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => {
      v.currentTime = offsetSeconds
      v.play().catch(() => {})
      setReady(true)
    }
    v.addEventListener('loadedmetadata', onLoaded)
    return () => v.removeEventListener('loadedmetadata', onLoaded)
  }, [isYouTube, offsetSeconds])

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-t2 font-bold">{!ready && 'جارٍ التحميل…'}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-s2 border border-bd text-t2 flex items-center justify-center">
            ✕
          </button>
        </div>
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
          {isYouTube ? (
            <div ref={containerRef} className="w-full h-full" />
          ) : (
            <video ref={videoRef} src={videoUrl} controls className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  )
}
