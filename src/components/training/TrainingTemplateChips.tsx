import { TRAINING_TEMPLATES } from '../../constants/trainingTemplates'

interface TrainingTemplateChipsProps {
  onPick: (title: string) => void
}

/** شرائح سريعة لاختيار عنوان تمرين جاهز بدل الكتابة الحرة — تبقى الكتابة اليدوية متاحة دائماً */
export function TrainingTemplateChips({ onPick }: TrainingTemplateChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {TRAINING_TEMPLATES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          className="px-2.5 py-1.5 bg-bg border border-bd rounded-lg text-[11px] font-bold text-t2"
        >
          {t}
        </button>
      ))}
    </div>
  )
}
