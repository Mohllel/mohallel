import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ClubProfile, OpponentPreset, Player } from '../types/domain'

const uid = () => Math.random().toString(36).slice(2, 11)

const initialState: ClubProfile = {
  userName: '',
  clubName: '',
  clubLogo: null,
  colors: { pri: '#0ea5e9', sec: '#f97316' },
  isPro: false,
  players: [],
  opponentPresets: [],
  opponentRosters: {},
}

interface ClubActions {
  setUserName: (name: string) => void
  setClubName: (name: string) => void
  setClubLogo: (logo: string | null) => void
  setColors: (colors: { pri: string; sec: string }) => void
  toggleIsPro: () => void

  addPlayer: (name: string, number?: number) => void
  removePlayer: (id: string) => void
  setPlayerPhoto: (id: string, photo: string) => void
  setPlayerNumber: (id: string, number: number | undefined) => void

  addOpponentPreset: (name: string, logo?: string | null) => string
  removeOpponentPreset: (id: string) => void
  setOpponentPresetLogo: (id: string, logo: string | null) => void

  addOpponentPlayer: (presetId: string, name: string, number?: number) => void
  removeOpponentPlayer: (presetId: string, playerId: string) => void
}

type Store = ClubProfile & ClubActions

export const useClubStore = create<Store>()(
  persist(
    (set) => ({
      ...initialState,

      setUserName: (userName) => set({ userName }),
      setClubName: (clubName) => set({ clubName }),
      setClubLogo: (clubLogo) => set({ clubLogo }),
      setColors: (colors) => set({ colors }),
      toggleIsPro: () => set((st) => ({ isPro: !st.isPro })),

      addPlayer: (name, number) =>
        set((st) => ({
          players: [...st.players, { id: uid(), name, number, photo: null, teamSide: 'A' } as Player],
        })),
      removePlayer: (id) => set((st) => ({ players: st.players.filter((p) => p.id !== id) })),
      setPlayerPhoto: (id, photo) =>
        set((st) => ({ players: st.players.map((p) => (p.id === id ? { ...p, photo } : p)) })),
      setPlayerNumber: (id, number) =>
        set((st) => ({ players: st.players.map((p) => (p.id === id ? { ...p, number } : p)) })),

      addOpponentPreset: (name, logo = null) => {
        const id = uid()
        set((st) => ({ opponentPresets: [...st.opponentPresets, { id, name, logo }] }))
        return id
      },
      removeOpponentPreset: (id) =>
        set((st) => ({
          opponentPresets: st.opponentPresets.filter((p) => p.id !== id),
          opponentRosters: Object.fromEntries(
            Object.entries(st.opponentRosters).filter(([pid]) => pid !== id),
          ),
        })),
      setOpponentPresetLogo: (id, logo) =>
        set((st) => ({
          opponentPresets: st.opponentPresets.map((p) => (p.id === id ? { ...p, logo } : p)),
        })),

      addOpponentPlayer: (presetId, name, number) =>
        set((st) => {
          const roster = st.opponentRosters[presetId] ?? []
          const player: Player = { id: uid(), name, number, photo: null, teamSide: 'B' }
          return { opponentRosters: { ...st.opponentRosters, [presetId]: [...roster, player] } }
        }),
      removeOpponentPlayer: (presetId, playerId) =>
        set((st) => {
          const roster = st.opponentRosters[presetId] ?? []
          return {
            opponentRosters: { ...st.opponentRosters, [presetId]: roster.filter((p) => p.id !== playerId) },
          }
        }),
    }),
    { name: 'mohallel-club' },
  ),
)

export type { OpponentPreset }
