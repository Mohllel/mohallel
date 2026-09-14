import type { RotationPosition } from '../types/domain'

export interface CourtPositionDef {
  position: RotationPosition
  /** إحداثيات نسبية % داخل نصف الملعب: x من اليسار، y من خط الشبكة نحو خط النهاية */
  x: number
  y: number
  label: string
}

/**
 * مواقع الطائرة الرسمية الثابتة (تناوب 1-6).
 * صف أمامي (قرب الشبكة): 4 يسار، 3 وسط، 2 يمين.
 * صف خلفي (بعيد عن الشبكة): 5 يسار، 6 وسط، 1 يمين (موقع الإرسال).
 */
export const COURT_POSITIONS: CourtPositionDef[] = [
  { position: 4, x: 20, y: 25, label: 'أمامي يسار' },
  { position: 3, x: 50, y: 25, label: 'أمامي وسط' },
  { position: 2, x: 80, y: 25, label: 'أمامي يمين' },
  { position: 5, x: 20, y: 75, label: 'خلفي يسار' },
  { position: 6, x: 50, y: 75, label: 'خلفي وسط' },
  { position: 1, x: 80, y: 75, label: 'خلفي يمين (الملقّم)' },
]

/**
 * تخطيط شبكي مضغوط (عمودان × 3 صفوف) لعرض جانبي (يمين/يسار) للفريقين معاً،
 * مطابق للبرامج الاحترافية: العمود الملاصق للشبكة = الصف الأمامي (2-3-4)،
 * العمود الخارجي = الصف الخلفي (1-6-5)، وكل صف يضم موقعين متجاورين مكانياً.
 * x نسبية % داخل نصف الملعب الخاص بهذا الفريق (0 يسار النصف، 100 يمينه).
 */
export function sideBySideLayout(side: 'A' | 'B'): CourtPositionDef[] {
  const netX = side === 'A' ? 78 : 22
  const outerX = side === 'A' ? 22 : 78
  return [
    { position: 1, x: outerX, y: 18, label: 'خلفي يمين (الملقّم)' },
    { position: 2, x: netX, y: 18, label: 'أمامي يمين' },
    { position: 6, x: outerX, y: 50, label: 'خلفي وسط' },
    { position: 3, x: netX, y: 50, label: 'أمامي وسط' },
    { position: 5, x: outerX, y: 82, label: 'خلفي يسار' },
    { position: 4, x: netX, y: 82, label: 'أمامي يسار' },
  ]
}
