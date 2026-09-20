import { useEffect, useState } from 'react'
import { deleteFeatureFlag, fetchFeatureFlags, upsertFeatureFlag, type FeatureFlag } from '../../lib/adminApi'
import { useFeatureFlagsStore } from '../../store/useFeatureFlagsStore'

export function AdminFeatureFlagsTab() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => fetchFeatureFlags().then(setFlags)

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
      await load()
      await useFeatureFlagsStore.getState().refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الإجراء')
    } finally {
      setBusy(false)
    }
  }

  const handleAdd = () => {
    const trimmed = key.trim()
    if (!trimmed) return
    setKey('')
    setDescription('')
    withBusy(() => upsertFeatureFlag(trimmed, false, description.trim()))
  }

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>

  return (
    <div className="bg-s1 border border-bd p-4">
      <div className="text-[14px] font-extrabold mb-1">🚩 تفعيل/تعطيل ميزات عن بُعد</div>
      <p className="text-[10px] text-t3 mb-3">
        عرّف مفتاحاً هنا (مثل <code dir="ltr">court-heatmaps</code>) ثم استخدم <code dir="ltr">useFeatureFlag(key)</code>{' '}
        بالكود لإخفاء أو إظهار أي ميزة لكل المستخدمين دفعة واحدة، بلا نشر إصدار جديد.
      </p>

      {flags.map((f) => (
        <div key={f.key} className="flex items-center gap-2 py-2 border-b border-bg last:border-b-0">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold font-mono truncate" dir="ltr">
              {f.key}
            </div>
            {f.description && <div className="text-[10px] text-t3 truncate">{f.description}</div>}
          </div>
          <button
            disabled={busy}
            onClick={() => withBusy(() => upsertFeatureFlag(f.key, !f.enabled, f.description))}
            className={`px-3 py-1.5 text-[11px] font-extrabold shrink-0 disabled:opacity-40 ${
              f.enabled ? 'bg-ok text-white' : 'bg-bd text-t2'
            }`}
          >
            {f.enabled ? 'مفعّلة' : 'معطّلة'}
          </button>
          <button
            disabled={busy}
            onClick={() => withBusy(() => deleteFeatureFlag(f.key))}
            className="w-7 h-7 rounded bg-err/10 text-err text-xs flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="flex gap-1.5 mt-3">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="key-name"
          dir="ltr"
          className="flex-1 font-mono"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="وصف مختصر..."
          className="flex-[1.5]"
        />
        <button
          onClick={handleAdd}
          disabled={busy}
          className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px] disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
