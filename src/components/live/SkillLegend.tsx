import { SKILLS } from '../../constants/skills'

/** يشرح الحروف المختصرة لأعمدة المهارات (D، R، P...) — يظهر أعلى الجدول بوضعَي الدقيق والسريع */
export function SkillLegend() {
  return (
    <div className="flex flex-wrap gap-x-2.5 gap-y-1 justify-center px-2 mb-2">
      {SKILLS.map((s) => (
        <span key={s.k} className="flex items-center gap-1 text-[9px] text-t2">
          <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.c }} />
          <strong className="font-extrabold">{s.k}</strong>
          <span className="text-t3">{s.l}</span>
        </span>
      ))}
    </div>
  )
}
