import type { Match } from '../types/domain'

/** ثانية الفيديو المقابلة لطابع زمني معيّن، أو null إن لم تُضبط المعايرة بعد */
export function getVideoOffsetSeconds(match: Match, ts: number): number | null {
  if (match.videoStartedAt == null) return null
  const seconds = (ts - match.videoStartedAt) / 1000
  return seconds >= 0 ? seconds : 0
}

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
]

export function parseYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeId(url) !== null
}

export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0) return `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${min}:${String(sec).padStart(2, '0')}`
}
