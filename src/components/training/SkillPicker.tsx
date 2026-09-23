import { SKILLS } from '../../constants/skills'
import type { SkillKey } from '../../types/domain'

interface SkillPickerProps {
  value: SkillKey | null
  onChange: (skill: SkillKey) => void
}

/** يحدّد المهارة الوحيدة التي يركّز عليها التمرين بأكمله */
export function SkillPicker({ value, onChange }: SkillPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SKILLS.map((s) => {
        const isSelected = value === s.k
        return (
          <button
            key={s.k}
            type="button"
            onClick={() => onChange(s.k)}
            className="py-3 rounded-xl border text-[12px] font-bold text-center"
            style={
              isSelected
                ? { background: s.c, borderColor: s.c, color: '#fff' }
                : { background: 'var(--color-bg)', borderColor: 'var(--color-bd)', color: 'var(--color-t2)' }
            }
          >
            {s.l}
          </button>
        )
      })}
    </div>
  )
}
