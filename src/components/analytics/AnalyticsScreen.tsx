import { useMemo, useState } from 'react'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { bestPlayer, commonErrors, suggestLineup, worstPlayer } from '../../lib/analytics'
import { COURT_POSITIONS } from '../../constants/courtPositions'
import { isMatchDecided } from '../../lib/scoring'
import { computeAggregateSideout, computeMatchSideout } from '../../lib/sideout'
import { computeRotationEffectiveness } from '../../lib/rotationEffectiveness'
import { PlayerTrendSection } from './PlayerTrendSection'

export function AnalyticsScreen() {
  const { players, isPro, opponentRosters } = useClubStore()
  const { matches } = useMatchesStore()
  const list = Object.values(matches)
    .filter((m) => m.status !== 'scheduled')
    .sort((a, b) => b.createdAt - a.createdAt)
  const [selected, setSelected] = useState<'all' | string>('all')

  const actions = useMemo(() => {
    if (selected === 'all') return list.flatMap((m) => m.act)
    return matches[selected]?.act ?? []
  }, [selected, list, matches])

  const best = bestPlayer(players, actions)
  const worst = worstPlayer(players, actions)
  const errors = commonErrors(players, actions).slice(0, 5)
  const lineup = suggestLineup(players, actions)

  const selectedMatch = selected !== 'all' ? matches[selected] : null
  const headToHead = selectedMatch
    ? list.filter((m) => m.opponentName === selectedMatch.opponentName && m.status === 'finished')
    : []
  const opponentRoster = selectedMatch?.opponentPresetId ? opponentRosters[selectedMatch.opponentPresetId] ?? [] : []
  const opponentActions = selectedMatch?.act ?? []
  const opponentBest = opponentRoster.length ? bestPlayer(opponentRoster, opponentActions) : null
  const opponentWorst = opponentRoster.length ? worstPlayer(opponentRoster, opponentActions) : null
  const opponentErrors = opponentRoster.length ? commonErrors(opponentRoster, opponentActions).slice(0, 3) : []

  const sideout = selectedMatch ? computeMatchSideout(selectedMatch) : computeAggregateSideout(list)
  const rotationStints = selectedMatch ? computeRotationEffectiveness(selectedMatch, 'A') : []
  const playerLabel = (id: string) => {
    const p = players.find((pl) => pl.id === id)
    return p ? `#${p.number ?? '—'}` : '—'
  }

  return (
    <div className="p-4 animate-[fadeIn_.3s_ease]">
      <h2 className="text-[18px] font-black mb-1">🧠 تحليل ذكي</h2>
      <p className="text-[11px] text-t3 mb-3">تحليل إحصائي مبني على الإجراءات المسجَّلة — ليس ذكاءً توليدياً بعد.</p>

      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="mb-4">
        <option value="all">كل المباريات</option>
        {list.map((m) => (
          <option key={m.id} value={m.id}>
            {m.date} — {m.opponentName}
          </option>
        ))}
      </select>

      <PlayerTrendSection players={players} matches={list} />

      {actions.length === 0 ? (
        <p className="text-center text-t3 text-[13px] mt-10">لا توجد بيانات كافية بعد.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <StatCard label="أفضل لاعب" name={best?.player.name} sub={best ? `متوسط ${best.average.toFixed(1)}` : '—'} color="var(--color-ok)" />
            <StatCard label="أضعف لاعب" name={worst?.player.name} sub={worst ? `متوسط ${worst.average.toFixed(1)}` : '—'} color="var(--color-err)" />
          </div>

          <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
            <div className="text-[14px] font-extrabold mb-2">🎯 نسبة صد الإرسال</div>
            {sideout.A.received === 0 ? (
              <p className="text-[12px] text-t3">لا توجد بيانات كافية بعد.</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-pri rounded-full" style={{ width: `${sideout.A.pct}%` }} />
                  </div>
                  <span className="text-[16px] font-black text-pri w-14 text-left">{sideout.A.pct}%</span>
                </div>
                <p className="text-[10px] text-t3 mt-1.5">
                  فاز فريقك بـ{sideout.A.won} من {sideout.A.received} كرة عند استقبال الإرسال
                  {selectedMatch ? '' : ' (كل المباريات مجمَّعة)'}. يُحتسب بافتراض أن الفائز بالنقطة يُرسل تالياً.
                </p>
              </>
            )}
          </div>

          {selectedMatch && (
            <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
              <div className="text-[14px] font-extrabold mb-2">🔄 فعالية التشكيلات</div>
              {rotationStints.length === 0 ? (
                <p className="text-[12px] text-t3">
                  لا توجد تشكيلة مكتملة (6 لاعبين) مسجَّلة بعد لهذه المباراة — عيّنها من خريطة الملعب.
                </p>
              ) : (
                rotationStints.slice(0, 5).map((stint, i) => {
                  const net = stint.pointsFor - stint.pointsAgainst
                  return (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-bd last:border-b-0">
                      <span className="flex-1 text-[11px] text-t2 truncate">
                        ش{stint.set} · {stint.playerIds.map(playerLabel).join(' ')}
                      </span>
                      <span className="text-[11px] font-bold text-t2">
                        {stint.pointsFor}:{stint.pointsAgainst}
                      </span>
                      <span className={`text-[11px] font-extrabold w-9 text-left ${net > 0 ? 'text-ok' : net < 0 ? 'text-err' : 'text-t3'}`}>
                        {net > 0 ? `+${net}` : net}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
            <div className="text-[14px] font-extrabold mb-2">اقتراح تشكيلة (إحصائي)</div>
            {lineup.every((s) => !s.player) ? (
              <p className="text-[12px] text-t3">لا توجد بيانات كافية لاقتراح تشكيلة.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {COURT_POSITIONS.slice()
                  .sort((a, b) => a.position - b.position)
                  .map((cp) => {
                    const slot = lineup.find((s) => s.position === cp.position)
                    return (
                      <div key={cp.position} className="bg-bg border border-bd rounded-lg p-2 text-center">
                        <div className="text-[9px] text-t3">{cp.position} · {cp.label}</div>
                        <div className="text-[12px] font-extrabold mt-0.5">{slot?.player?.name ?? '—'}</div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
            <div className="text-[14px] font-extrabold mb-2">الأخطاء الشائعة</div>
            {errors.length === 0 ? (
              <p className="text-[12px] text-t3">لا أخطاء مسجَّلة.</p>
            ) : (
              errors.map((e) => (
                <div key={e.player.id} className="flex justify-between text-[12px] py-1 border-b border-bd last:border-b-0">
                  <span className="font-bold">{e.player.name}</span>
                  <span className="text-err font-extrabold">{e.count}</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-s1 border border-bd rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[14px] font-extrabold">تحليل المنافس</div>
              {!isPro && <span className="text-[10px] font-bold text-sec">🔒 PRO</span>}
            </div>
            {!isPro ? (
              <p className="text-[12px] text-t3">تحليل مفصّل لنقاط قوة وضعف المنافس متاح في النسخة المدفوعة.</p>
            ) : !selectedMatch ? (
              <p className="text-[12px] text-t3">اختر مباراة محددة أعلاه لعرض تحليل منافسها.</p>
            ) : (
              <div>
                <p className="text-[12px] text-t2 mb-1.5">السجل ضد {selectedMatch.opponentName}:</p>
                {headToHead.map((m) => (
                  <div key={m.id} className="flex justify-between text-[11px] py-0.5 mb-2">
                    <span>{m.date}</span>
                    <span className={isMatchDecided(m.setWinners) === 'A' ? 'text-ok' : 'text-err'}>
                      {isMatchDecided(m.setWinners) === 'A' ? 'فوز' : 'خسارة'}
                    </span>
                  </div>
                ))}

                {opponentRoster.length === 0 ? (
                  <p className="text-[11px] text-t3 pt-2 border-t border-bd">
                    لم تُسجَّل مهارات لاعبي هذا المنافس بعد — سجّلها من خريطة الملعب أثناء المباراة (يتطلب روستر محفوظ للمنافس من الإعدادات).
                  </p>
                ) : (
                  <div className="pt-2 border-t border-bd">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-t2">أقوى لاعب لديهم</span>
                      <span className="font-extrabold text-err">
                        {opponentBest ? `${opponentBest.player.name} (${opponentBest.average.toFixed(1)})` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-t2">أضعف لاعب لديهم</span>
                      <span className="font-extrabold text-ok">
                        {opponentWorst ? `${opponentWorst.player.name} (${opponentWorst.average.toFixed(1)})` : '—'}
                      </span>
                    </div>
                    {opponentErrors.length > 0 && (
                      <div className="mt-1.5">
                        <span className="text-t2 text-[11px]">أكثرهم أخطاءً: </span>
                        {opponentErrors.map((e, i) => (
                          <span key={e.player.id} className="text-[11px] font-bold">
                            {e.player.name} ({e.count}){i < opponentErrors.length - 1 ? '، ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, name, sub, color }: { label: string; name?: string; sub: string; color: string }) {
  return (
    <div className="bg-s1 border border-bd rounded-2xl p-3">
      <div className="text-[10px] text-t3 mb-1">{label}</div>
      <div className="text-[14px] font-extrabold" style={{ color }}>
        {name ?? '—'}
      </div>
      <div className="text-[10px] text-t3">{sub}</div>
    </div>
  )
}
