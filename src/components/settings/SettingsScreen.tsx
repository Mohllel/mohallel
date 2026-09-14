import { useClubStore } from '../../store/useClubStore'
import { LogoUpload } from '../shared/LogoUpload'
import { OpponentsSection } from './OpponentsSection'
import { RosterSection } from './RosterSection'

export function SettingsScreen() {
  const { userName, clubName, clubLogo, colors, isPro, setUserName, setClubName, setClubLogo, setColors, toggleIsPro } =
    useClubStore()

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-3">⚙ لوحة التحكم</h2>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">الملف الشخصي</div>
        <label className="block text-[11px] text-t2 mb-1 font-bold">اسم المستخدم</label>
        <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="اسمك" className="mb-3" />
        <label className="block text-[11px] text-t2 mb-1 font-bold">اسم النادي / الفريق</label>
        <input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="اسم النادي" />
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">شعار النادي</div>
        <LogoUpload value={clubLogo} onChange={setClubLogo} size={64} />
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-3">الألوان</div>
        <div className="flex gap-4">
          <ColorField label="اللون الأساسي" value={colors.pri} onChange={(v) => setColors({ ...colors, pri: v })} />
          <ColorField label="اللون الثانوي" value={colors.sec} onChange={(v) => setColors({ ...colors, sec: v })} />
        </div>
      </div>

      <RosterSection />
      <OpponentsSection />

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3 flex items-center justify-between">
        <div>
          <div className="text-[14px] font-extrabold">النسخة المدفوعة (PRO)</div>
          <div className="text-[10px] text-t3 mt-0.5">مفتاح تطوير محلي — بلا دفع فعلي بعد</div>
        </div>
        <button
          onClick={toggleIsPro}
          className={`w-14 h-8 rounded-full relative transition-colors ${isPro ? 'bg-ok' : 'bg-bd'}`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isPro ? 'right-1' : 'right-7'}`}
          />
        </button>
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1">
      <label className="block text-[11px] text-t2 mb-1 font-bold">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 p-0 rounded-lg border border-bd bg-transparent"
        />
        <span className="text-[11px] text-t3">{value}</span>
      </div>
    </div>
  )
}
