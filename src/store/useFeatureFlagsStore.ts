import { create } from 'zustand'
import { fetchFeatureFlags } from '../lib/adminApi'

interface FeatureFlagsState {
  enabledKeys: Set<string>
  loaded: boolean
  refresh: () => Promise<void>
}

export const useFeatureFlagsStore = create<FeatureFlagsState>((set) => ({
  enabledKeys: new Set(),
  loaded: false,
  refresh: async () => {
    const flags = await fetchFeatureFlags()
    set({ enabledKeys: new Set(flags.filter((f) => f.enabled).map((f) => f.key)), loaded: true })
  },
}))

/** استخدمها بأي مكوّن لإخفاء/إظهار ميزة حسب مفتاح مُعرَّف بلوحة المطوّر — غير معرَّف = معطّلة افتراضياً */
export function useFeatureFlag(key: string): boolean {
  return useFeatureFlagsStore((s) => s.enabledKeys.has(key))
}
