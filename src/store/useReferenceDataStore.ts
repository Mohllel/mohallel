import { create } from 'zustand'
import { fetchReferenceClubs, fetchReferenceCompetitions } from '../lib/referenceData'
import type { CompetitionPreset, OpponentPreset } from '../types/domain'

interface ReferenceDataState {
  clubs: OpponentPreset[]
  competitions: CompetitionPreset[]
  loaded: boolean
  refresh: () => Promise<void>
}

/** كاش بسيط بالذاكرة للبيانات المرجعية العامة (الأندية والمسابقات) — تُحدَّث مرة عند تسجيل الدخول، ويدوياً بعد أي تعديل بلوحة المطوّر */
export const useReferenceDataStore = create<ReferenceDataState>((set) => ({
  clubs: [],
  competitions: [],
  loaded: false,
  refresh: async () => {
    const [clubs, competitions] = await Promise.all([fetchReferenceClubs(), fetchReferenceCompetitions()])
    set({ clubs, competitions, loaded: true })
  },
}))
