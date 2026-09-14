import { forwardRef } from 'react'
import { QUALITIES } from '../../../constants/quality'
import { SKILLS } from '../../../constants/skills'
import { playerErrorCount, playerPoints } from '../../../lib/analytics'
import { playerStats } from '../../../lib/stats'
import type { Action, Player } from '../../../types/domain'
import { SkillQualityHeatmap } from '../SkillQualityHeatmap'

interface PlayerCardProps {
  player: Player
  actions: Action[]
}

/** بطاقة لاعب — صفحة PDF مستقلة (رأس + جدول تفصيلي + خريطة حرارية) */
export const PlayerCard = forwardRef<HTMLDivElement, PlayerCardProps>(({ player, actions }, ref) => {
  const stats = playerStats(actions, player.id)
  const points = playerPoints(actions, player.id)
  const errors = playerErrorCount(actions, player.id)

  return (
    <div ref={ref} style={{ width: 700 }} className="bg-bg text-t1 p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-12 h-12 rounded-full bg-gradient-to-br from-pri to-[#0284c7] text-white text-[15px] font-black flex items-center justify-center shrink-0">
          {player.number ?? '—'}
        </span>
        <div className="flex-1">
          <div className="text-[18px] font-black">{player.name}</div>
          <div className="text-[11px] text-t3">{stats.tot} إجراء</div>
        </div>
        <div className="text-center px-3">
          <div className="text-[18px] font-black text-ok">{points}</div>
          <div className="text-[9px] text-t3">نقاط</div>
        </div>
        <div className="text-center px-3">
          <div className="text-[18px] font-black text-err">{errors}</div>
          <div className="text-[9px] text-t3">أخطاء</div>
        </div>
      </div>

      <div className="text-[13px] font-extrabold mb-2">تفصيل المهارات</div>
      <div className="bg-s1 border border-bd rounded-2xl overflow-hidden mb-6">
        <div className="flex px-3 py-2 bg-s2 border-b border-bd">
          <span className="flex-[2] text-[11px] text-right font-semibold">المهارة</span>
          <span className="flex-1 text-[11px] text-center font-semibold">المجموع</span>
          <span className="flex-1 text-[11px] text-center font-semibold">المتوسط</span>
          {QUALITIES.map((q) => (
            <span key={q.v} style={{ color: q.c }} className="flex-1 text-[11px] text-center font-semibold">
              {q.s}
            </span>
          ))}
        </div>
        {SKILLS.map((s) => (
          <div key={s.k} className="flex px-3 py-2 border-b border-bd last:border-b-0">
            <span className="flex-[2] text-[11px] text-right font-extrabold" style={{ color: s.c }}>
              {s.l}
            </span>
            <span className="flex-1 text-[11px] text-center">{stats[s.k].t}</span>
            <span className="flex-1 text-[11px] text-center">{stats[s.k].avg}</span>
            {stats[s.k].cn.map((n, i) => (
              <span key={i} className="flex-1 text-[11px] text-center">
                {n || '—'}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="text-[13px] font-extrabold mb-2">الخريطة الحرارية</div>
      <div className="bg-s1 border border-bd rounded-2xl p-4 inline-block">
        <SkillQualityHeatmap actions={actions} playerId={player.id} size="full" />
      </div>
    </div>
  )
})
PlayerCard.displayName = 'PlayerCard'
