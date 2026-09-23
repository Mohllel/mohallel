import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ClubProfile, CompetitionPreset, OpponentPreset, Player } from '../types/domain'
import { supabaseStorage } from '../lib/supabaseStorage'

const uid = () => Math.random().toString(36).slice(2, 11)

const initialState: ClubProfile = {
  userName: '',
  clubName: '',
  clubLogo: null,
  jerseyPhoto: null,
  headerImage: null,
  bio: '',
  colors: { pri: '#0ea5e9', sec: '#f97316' },
  isPro: false,
  players: [],
  opponentRosters: {},
}

interface ClubActions {
  setUserName: (name: string) => void
  setClubName: (name: string) => void
  setClubLogo: (logo: string | null) => void
  setJerseyPhoto: (photo: string | null) => void
  setHeaderImage: (image: string | null) => void
  setBio: (bio: string) => void
  setColors: (colors: { pri: string; sec: string }) => void
  toggleIsPro: () => void

  addPlayer: (name: string, number?: number) => void
  removePlayer: (id: string) => void
  setPlayerPhoto: (id: string, photo: string) => void
  setPlayerNumber: (id: string, number: number | undefined) => void
  setPlayerPosition: (id: string, position: Player['position']) => void
  setPlayerBio: (id: string, bio: string) => void

  /** presetId هنا معرّف نادٍ مرجعي عام (من reference_clubs) — روستر المنافس يبقى بيانات خاصة بحساب هذا النادي فقط */
  addOpponentPlayer: (presetId: string, name: string, number?: number) => string
  removeOpponentPlayer: (presetId: string, playerId: string) => void

  /** يعيد ملف النادي (الاسم، الشعار، الألوان، اللاعبون...) لحالته الابتدائية — جزء من "إعادة التعيين" بالإعدادات */
  resetClub: () => void
}

type Store = ClubProfile & ClubActions

/** يُحوّل مسميات المراكز القديمة (طرفي/معاكس/وسط) إلى نظام الترقيم الجديد (٤/٣/٢) بلا فقد بيانات */
const OLD_POSITION_MAP: Record<string, string> = { outside: 'hitter4', middle: 'hitter3', opposite: 'hitter2' }

function migrateClubState(persisted: unknown): Store {
  const state = persisted as Store
  const remapPlayers = (players: Player[] | undefined) =>
    (players ?? []).map((p) =>
      p.position && p.position in OLD_POSITION_MAP
        ? { ...p, position: OLD_POSITION_MAP[p.position] as Player['position'] }
        : p,
    )

  return {
    ...state,
    players: remapPlayers(state.players),
    opponentRosters: Object.fromEntries(
      Object.entries(state.opponentRosters ?? {}).map(([id, roster]) => [id, remapPlayers(roster)]),
    ),
  }
}

export const useClubStore = create<Store>()(
  persist(
    (set) => ({
      ...initialState,

      setUserName: (userName) => set({ userName }),
      setClubName: (clubName) => set({ clubName }),
      setClubLogo: (clubLogo) => set({ clubLogo }),
      setJerseyPhoto: (jerseyPhoto) => set({ jerseyPhoto }),
      setHeaderImage: (headerImage) => set({ headerImage }),
      setBio: (bio) => set({ bio }),
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
      setPlayerPosition: (id, position) =>
        set((st) => ({ players: st.players.map((p) => (p.id === id ? { ...p, position } : p)) })),
      setPlayerBio: (id, bio) =>
        set((st) => ({ players: st.players.map((p) => (p.id === id ? { ...p, bio } : p)) })),

      addOpponentPlayer: (presetId, name, number) => {
        const id = uid()
        set((st) => {
          const roster = st.opponentRosters[presetId] ?? []
          const player: Player = { id, name, number, photo: null, teamSide: 'B' }
          return { opponentRosters: { ...st.opponentRosters, [presetId]: [...roster, player] } }
        })
        return id
      },
      removeOpponentPlayer: (presetId, playerId) =>
        set((st) => {
          const roster = st.opponentRosters[presetId] ?? []
          return {
            opponentRosters: { ...st.opponentRosters, [presetId]: roster.filter((p) => p.id !== playerId) },
          }
        }),

      resetClub: () => set({ ...initialState }),
    }),
    {
      name: 'mohallel-club',
      storage: createJSONStorage(() => supabaseStorage),
      skipHydration: true,
      version: 1,
      migrate: (persisted) => migrateClubState(persisted),
    },
  ),
)

export type { OpponentPreset, CompetitionPreset }
