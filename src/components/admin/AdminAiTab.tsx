import { useEffect, useState } from 'react'
import { fetchAiPrompt, setAiPrompt } from '../../lib/adminApi'

export function AdminAiTab() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAiPrompt()
      .then(setPrompt)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setAiPrompt(prompt)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>

  return (
    <div className="bg-s1 border border-bd p-4">
      <div className="text-[14px] font-extrabold mb-1">🤖 برومت تحسين صور اللاعبين (Nano Banana)</div>
      <p className="text-[10px] text-t3 mb-3">
        يُرسَل هذا النص إلى Gemini مع صورة اللاعب وصورة الزي الرسمي عند الضغط على «✨ تحسين بالذكاء الاصطناعي» — برومت
        واحد يُستخدم لكل حسابات المنصة. يُقرأ مباشرة من Edge Function عند كل طلب، فالتعديل يسري فوراً بلا إعادة نشر.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={16}
        dir="ltr"
        className="w-full bg-bg border border-bd p-2 text-[12px] font-mono mb-3"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 bg-pri text-white font-extrabold text-[13px] disabled:opacity-40"
      >
        {saving ? 'جارٍ الحفظ...' : 'حفظ البرومت'}
      </button>
    </div>
  )
}
