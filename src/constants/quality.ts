import type { Quality } from '../types/domain'

export interface QualityDef {
  v: Quality
  l: string
  s: string
  c: string
}

/** 4 مستويات تقييم ثابتة لكل إجراء */
export const QUALITIES: QualityDef[] = [
  { v: 3, l: 'ممتاز جداً', s: '++', c: '#10b981' },
  { v: 2, l: 'ممتاز', s: '+', c: '#22c55e' },
  { v: 1, l: 'جيد', s: '~', c: '#eab308' },
  { v: 0, l: 'ضعيف', s: '-', c: '#ef4444' },
]

export const qualityByValue = (v: Quality): QualityDef =>
  QUALITIES.find((q) => q.v === v)!

export const DEFAULT_QUICK_QUALITY: Quality = 2
