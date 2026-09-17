import { useNavigate, useParams } from 'react-router-dom'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { buildScoutingReport } from '../../lib/scouting'
import { ZoneHeatmap } from '../analytics/ZoneHeatmap'

export function ScoutingReportScreen() {
  const { presetId } = useParams<{ presetId: string }>()
  const navigate = useNavigate()
  const { opponentPresets, opponentRosters, isPro } = useClubStore()
  const { matches } = useMatchesStore()

  const preset = opponentPresets.find((p) => p.id === presetId)

  if (!presetId || !preset) {
    return (
      <div className="p-6 text-center text-t3">
        <p className="mb-4">لم يتم العثور على هذا المنافس.</p>
        <button onClick={() => navigate('/settings')} className="text-pri font-bold">
          العودة للإعدادات
        </button>
      </div>
    )
  }

  const roster = opponentRosters[presetId] ?? []
  const report = buildScoutingReport(Object.values(matches), presetId, roster)

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-[34px] h-[34px] rounded-[10px] bg-s2 border border-bd text-t2 flex items-center justify-center"
        >
          ←
        </button>
        <h2 className="text-[18px] font-black flex-1">📋 استطلاع {preset.name}</h2>
      </div>

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="text-[14px] font-extrabold mb-2">السجل التاريخي</div>
        {report.matchesPlayed === 0 ? (
          <p className="text-[12px] text-t3">لم تُلعب أي مباراة ضد هذا الفريق بعد.</p>
        ) : (
          <div className="flex justify-around text-center">
            <div>
              <div className="text-[20px] font-black text-t1">{report.matchesPlayed}</div>
              <div className="text-[10px] text-t3">مباريات</div>
            </div>
            <div>
              <div className="text-[20px] font-black text-ok">{report.ourWins}</div>
              <div className="text-[10px] text-t3">فوز</div>
            </div>
            <div>
              <div className="text-[20px] font-black text-err">{report.ourLosses}</div>
              <div className="text-[10px] text-t3">خسارة</div>
            </div>
          </div>
        )}
      </div>

      {report.matchesPlayed > 0 && (
        <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
          <div className="text-[14px] font-extrabold mb-3">🗺️ أين يسجّل هذا المنافس نقاطه</div>
          {report.opponentZones.every((c) => c === 0) ? (
            <p className="text-[12px] text-t3">لا توجد نقاط مسجَّلة من خريطة الملعب بمبارياتكم السابقة معه بعد.</p>
          ) : (
            <div className="max-w-[160px] mx-auto">
              <ZoneHeatmap counts={report.opponentZones} color="var(--color-err)" />
            </div>
          )}
        </div>
      )}

      <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[14px] font-extrabold">نقاط القوة والضعف</div>
          {!isPro && <span className="text-[10px] font-bold text-sec">🔒 PRO</span>}
        </div>

        {!isPro ? (
          <p className="text-[12px] text-t3">تحليل تفصيلي للاعبي المنافس متاح في النسخة المدفوعة.</p>
        ) : !report.hasRosterData ? (
          <p className="text-[12px] text-t3">
            لا توجد بيانات مسجَّلة للاعبي هذا المنافس بعد. أضف روستره من الإعدادات، وسجّل مهاراته من خريطة الملعب أثناء المباريات القادمة ليظهر التحليل هنا.
          </p>
        ) : (
          <div className="space-y-3">
            <Row label="أقوى لاعب" value={report.bestPlayer ? `${report.bestPlayer.player.name} (متوسط ${report.bestPlayer.average.toFixed(1)})` : '—'} color="var(--color-err)" />
            <Row label="أضعف لاعب" value={report.worstPlayer ? `${report.worstPlayer.player.name} (متوسط ${report.worstPlayer.average.toFixed(1)})` : '—'} color="var(--color-ok)" />
            <Row
              label="الأكثر خطأً بالإرسال"
              value={report.serveErrorLeaders[0] ? `${report.serveErrorLeaders[0].player.name} (${report.serveErrorLeaders[0].count} أخطاء)` : 'لا يوجد'}
              color="var(--color-ok)"
            />
            <Row
              label="الأكثر أخطاءً عموماً"
              value={report.errorLeaders[0] ? `${report.errorLeaders[0].player.name} (${report.errorLeaders[0].count} أخطاء)` : 'لا يوجد'}
              color="var(--color-ok)"
            />
            <Row
              label="الأكثر هجوماً"
              value={report.mostFrequentAttacker ? `${report.mostFrequentAttacker.player.name} (${report.mostFrequentAttacker.count} محاولة)` : 'لا يوجد'}
              color="var(--color-err)"
            />
          </div>
        )}

        {isPro && report.hasRosterData && (
          <p className="text-[10px] text-t3 mt-3 pt-3 border-t border-bd">
            💡 تحليل مكان الهجوم (يمين/وسط/يسار) غير متاح حالياً — خريطة الملعب لا تُسجّل مكان سقوط الكرة لكل لاعب حالياً بعد تبسيطها.
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-t2">{label}</span>
      <span className="text-[12px] font-extrabold" style={{ color }}>
        {value}
      </span>
    </div>
  )
}
