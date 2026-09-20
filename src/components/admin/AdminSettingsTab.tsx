import { useEffect, useState } from 'react'
import { fetchAppSettings, migrateClubDataTo, updateAppSettings, type AppSettings } from '../../lib/adminApi'

export function AdminSettingsTab() {
  const [settings, setSettings] = useState<AppSettings>({ maintenance_mode: false, announcement: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAppSettings()
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAppSettings(settings)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-t3 text-[13px] mt-10">جارٍ التحميل...</p>

  return (
    <div className="space-y-3">
      <div className="bg-s1 border border-bd p-4">
        <div className="text-[14px] font-extrabold mb-3">إعدادات عامة</div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-bold">وضع الصيانة</div>
          <button
            onClick={() => setSettings((s) => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
            className={`w-14 h-8 rounded-full relative transition-colors ${settings.maintenance_mode ? 'bg-err' : 'bg-bd'}`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.maintenance_mode ? 'right-1' : 'right-7'}`}
            />
          </button>
        </div>
        <label className="block text-[11px] text-t2 mb-1 font-bold">رسالة إعلان عامة (اتركها فاضية لإخفائها)</label>
        <textarea
          value={settings.announcement}
          onChange={(e) => setSettings((s) => ({ ...s, announcement: e.target.value }))}
          rows={2}
          className="w-full bg-bg border border-bd p-2 text-[13px] mb-3"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-pri text-white font-extrabold text-[13px] disabled:opacity-40"
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <DataMigrationSection />
    </div>
  )
}

function DataMigrationSection() {
  const [targetEmail, setTargetEmail] = useState('')
  const [busy, setBusy] = useState(false)

  const handleMigrate = async () => {
    const trimmed = targetEmail.trim()
    if (!trimmed) return
    if (
      !confirm(
        `سيتم نقل كل بيانات النادي الحالية بهذا الحساب (الملف، اللاعبون، المباريات، التدريب) إلى الحساب المسجَّل بالبريد:\n${trimmed}\n\nيجب أن يكون هذا الحساب قد سجّل دخوله مرة واحدة على الأقل. هل تريد المتابعة؟`,
      )
    ) {
      return
    }
    setBusy(true)
    try {
      await migrateClubDataTo(trimmed)
      alert('تم النقل بنجاح.')
      setTargetEmail('')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل النقل')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-s1 border border-bd p-4">
      <div className="text-[14px] font-extrabold mb-1">نقل بيانات النادي لحساب آخر</div>
      <p className="text-[10px] text-t3 mb-3">
        لفصل حساب المطوّر عن أي بيانات نادٍ نهائياً: أنشئ حساباً جديداً بالبريد الذي تريده وسجّل دخوله مرة واحدة، ثم
        اكتب بريده هنا. سيُنقَل كل ملف النادي واللاعبين والمباريات والتدريب لذلك الحساب، ويصبح حساب المطوّر بلا أي
        بيانات نادٍ من بعدها.
      </p>
      <input
        value={targetEmail}
        onChange={(e) => setTargetEmail(e.target.value)}
        placeholder="البريد الإلكتروني للحساب الجديد"
        dir="ltr"
        className="mb-3"
      />
      <button
        onClick={handleMigrate}
        disabled={busy || !targetEmail.trim()}
        className="w-full py-2.5 bg-err text-white font-extrabold text-[13px] disabled:opacity-40"
      >
        {busy ? 'جارٍ النقل...' : 'نقل البيانات'}
      </button>
    </div>
  )
}
