import { useState } from 'react'
import { useReferenceDataStore } from '../../store/useReferenceDataStore'
import {
  adminAddReferenceClub,
  adminAddReferenceCompetition,
  adminRemoveReferenceClub,
  adminRemoveReferenceCompetition,
  adminSetCompetitionEligibility,
} from '../../lib/referenceData'

export function AdminReferenceDataTab() {
  const { clubs, competitions, refresh } = useReferenceDataStore()
  const [clubName, setClubName] = useState('')
  const [competitionName, setCompetitionName] = useState('')
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الإجراء')
    } finally {
      setBusy(false)
    }
  }

  const handleAddClub = () => {
    const trimmed = clubName.trim()
    if (!trimmed) return
    setClubName('')
    withBusy(() => adminAddReferenceClub(trimmed).then(() => {}))
  }

  const handleAddCompetition = () => {
    const trimmed = competitionName.trim()
    if (!trimmed) return
    setCompetitionName('')
    withBusy(() => adminAddReferenceCompetition(trimmed).then(() => {}))
  }

  const selected = competitions.find((c) => c.id === selectedCompetition) ?? null

  return (
    <div className="space-y-3">
      <div className="bg-s1 border border-bd p-4">
        <div className="text-[14px] font-extrabold mb-3">🆚 الأندية المرجعية ({clubs.length})</div>
        <p className="text-[10px] text-t3 mb-3">
          هذه القائمة موحّدة لكل حسابات النادي على المنصة — أي إضافة أو حذف هنا يظهر فوراً لجميع المستخدمين.
        </p>

        {clubs.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {clubs.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 bg-bg border border-bd rounded-lg px-3 py-2">
                <span className="text-[12px] font-bold truncate">{c.name}</span>
                <button
                  disabled={busy}
                  onClick={() => withBusy(() => adminRemoveReferenceClub(c.id))}
                  className="w-6 h-6 shrink-0 rounded bg-err/10 text-err text-[10px] flex items-center justify-center disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1.5">
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddClub()}
            placeholder="اسم نادٍ جديد..."
            className="flex-1"
          />
          <button
            onClick={handleAddClub}
            disabled={busy}
            className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px] disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-s1 border border-bd p-4">
        <div className="text-[14px] font-extrabold mb-3">🏆 المسابقات ({competitions.length})</div>

        {competitions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {competitions.map((c) => (
              <span
                key={c.id}
                className={`flex items-center gap-1.5 border rounded-full pl-1.5 pr-3 py-1.5 text-[12px] font-bold ${
                  selectedCompetition === c.id ? 'bg-pri/10 border-pri' : 'bg-bg border-bd'
                }`}
              >
                <button onClick={() => setSelectedCompetition(selectedCompetition === c.id ? null : c.id)}>
                  {c.name}
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (selectedCompetition === c.id) setSelectedCompetition(null)
                    withBusy(() => adminRemoveReferenceCompetition(c.id))
                  }}
                  className="w-5 h-5 rounded-full bg-err/10 text-err text-[10px] flex items-center justify-center disabled:opacity-40"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {selected && (
          <div className="bg-bg border border-bd rounded-xl p-3 mb-3">
            <div className="text-[12px] font-bold mb-2">
              الأندية المشاركة في «{selected.name}» — بلا تحديد يعني بلا حصر (تظهر لأي منافس)
            </div>
            {clubs.length === 0 ? (
              <p className="text-[11px] text-t3">أضف أندية مرجعية أولاً بالأعلى.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {clubs.map((club) => {
                  const active = selected.eligibleOpponentIds?.includes(club.id) ?? false
                  return (
                    <button
                      key={club.id}
                      disabled={busy}
                      onClick={() => {
                        const current = selected.eligibleOpponentIds ?? []
                        const next = active ? current.filter((id) => id !== club.id) : [...current, club.id]
                        withBusy(() => adminSetCompetitionEligibility(selected.id, next))
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-40 ${
                        active ? 'bg-ok/15 border-ok text-ok' : 'bg-s1 border-bd text-t2'
                      }`}
                    >
                      {active ? '✓ ' : ''}
                      {club.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-1.5">
          <input
            value={competitionName}
            onChange={(e) => setCompetitionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCompetition()}
            placeholder="اسم مسابقة جديدة..."
            className="flex-1"
          />
          <button
            onClick={handleAddCompetition}
            disabled={busy}
            className="px-4 py-2.5 bg-pri text-white rounded-[10px] font-extrabold text-[13px] disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
