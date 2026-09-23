const WEEKDAY_LABELS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export interface Weekday {
  value: number
  label: string
}

/** أيام الأسبوع بترتيب يبدأ بالأحد، لاستخدامها باختيار أيام التكرار */
export const WEEKDAYS: Weekday[] = WEEKDAY_LABELS.map((label, value) => ({ value, label }))

/** ينسّق تاريخاً محلياً كـ YYYY-MM-DD بلا تحويل UTC — toISOString() يُزيح التاريخ يوماً كاملاً بمناطق زمنية موجبة مثل البحرين (UTC+3) */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * يولّد كل التواريخ (YYYY-MM-DD) بين startDate وحتى نهاية عدد الأسابيع المطلوب،
 * التي تقع على أحد أيام الأسبوع المختارة — يُستخدم لجدولة تمارين متكررة دفعة واحدة.
 */
export function generateRecurringDates(startDate: string, weekdays: number[], weeks: number): string[] {
  if (weekdays.length === 0) return [startDate]
  const start = new Date(`${startDate}T00:00:00`)
  const totalDays = weeks * 7
  const dates: string[] = []
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (weekdays.includes(d.getDay())) {
      dates.push(toLocalDateString(d))
    }
  }
  return dates
}
