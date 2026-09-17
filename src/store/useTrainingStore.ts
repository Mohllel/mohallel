import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabaseStorage } from '../lib/supabaseStorage'
import type { Quality, SkillKey, TrainingSession } from '../types/domain'

const uid = () => Math.random().toString(36).slice(2, 11)

interface AddRepInput {
  playerId: string
  skill: SkillKey
  quality: Quality
}

interface TrainingState {
  sessions: Record<string, TrainingSession>
  _undoIds: Record<string, string | null>
}

interface TrainingActions {
  createSession: (title: string, date: string, playerIds: string[]) => string
  deleteSession: (id: string) => void
  addRep: (sessionId: string, input: AddRepInput) => void
  undoLastRep: (sessionId: string) => void
  lastRepId: (sessionId: string) => string | null
}

type Store = TrainingState & TrainingActions

const undoTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export const useTrainingStore = create<Store>()(
  persist(
    (set, get) => ({
      sessions: {},
      _undoIds: {},

      createSession: (title, date, playerIds) => {
        const id = uid()
        const session: TrainingSession = { id, createdAt: Date.now(), date, title, playerIds, reps: [] }
        set((st) => ({ sessions: { ...st.sessions, [id]: session } }))
        return id
      },
      deleteSession: (id) =>
        set((st) => {
          const next = { ...st.sessions }
          delete next[id]
          return { sessions: next }
        }),
      addRep: (sessionId, input) => {
        set((st) => {
          const session = st.sessions[sessionId]
          if (!session) return st
          const rep = { id: uid(), set: 1, ts: Date.now(), side: 'A' as const, ...input }
          return {
            sessions: { ...st.sessions, [sessionId]: { ...session, reps: [...session.reps, rep] } },
            _undoIds: { ...st._undoIds, [sessionId]: rep.id },
          }
        })
        if (undoTimers[sessionId]) clearTimeout(undoTimers[sessionId])
        undoTimers[sessionId] = setTimeout(() => {
          set((st) => ({ _undoIds: { ...st._undoIds, [sessionId]: null } }))
        }, 3500)
      },
      undoLastRep: (sessionId) => {
        const undoId = get()._undoIds[sessionId]
        if (!undoId) return
        if (undoTimers[sessionId]) clearTimeout(undoTimers[sessionId])
        set((st) => {
          const session = st.sessions[sessionId]
          if (!session) return st
          return {
            sessions: { ...st.sessions, [sessionId]: { ...session, reps: session.reps.filter((r) => r.id !== undoId) } },
            _undoIds: { ...st._undoIds, [sessionId]: null },
          }
        })
      },
      lastRepId: (sessionId) => get()._undoIds[sessionId] ?? null,
    }),
    {
      name: 'mohallel-training',
      storage: createJSONStorage(() => supabaseStorage),
      skipHydration: true,
    },
  ),
)
