import type { SkillKey } from '../types/domain'

export interface SkillDef {
  k: SkillKey
  l: string
  c: string
}

/** المهارات التسع — ثابتة، لا تُضاف عليها مهارات جديدة */
export const SKILLS: SkillDef[] = [
  { k: 'D', l: 'الدفاع', c: '#0ea5e9' },
  { k: 'R', l: 'الإستقبال', c: '#ef4444' },
  { k: 'P', l: 'الإسقاط', c: '#eab308' },
  { k: 'S', l: 'الهجوم', c: '#10b981' },
  { k: 'F', l: 'الأخطاء', c: '#ec4899' },
  { k: 'N', l: 'الشبك', c: '#8b5cf6' },
  { k: 'B', l: 'البلوك', c: '#14b8a6' },
  { k: 'C', l: 'التغطية', c: '#f97316' },
  { k: 'SS', l: 'الإرسال', c: '#3b82f6' },
]

export const skillByKey = (k: SkillKey): SkillDef =>
  SKILLS.find((s) => s.k === k)!

/** المهارات المتاحة سريعاً من خريطة الملعب */
export const COURT_SKILLS: SkillKey[] = ['S', 'R', 'SS', 'D', 'B', 'P']

export const SERVE_TYPES: { v: import('../types/domain').ServeType; l: string }[] = [
  { v: 'normal', l: 'عادي' },
  { v: 'float', l: 'فلوتر' },
  { v: 'ace', l: 'مباشر (نقطة)' },
  { v: 'error', l: 'ضائع (خطأ)' },
]
