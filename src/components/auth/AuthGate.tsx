import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { checkAndOfferLocalImport } from '../../lib/importLocalData'
import { Logo } from '../brand/Logo'
import { LoginScreen } from './LoginScreen'

function Splash() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="animate-pulse">
        <Logo size={48} />
      </div>
    </div>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, user, loading } = useAuthStore()
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    if (!session || !user) {
      setDataReady(false)
      return
    }
    let cancelled = false
    ;(async () => {
      await Promise.all([
        useClubStore.persist.rehydrate(),
        useMatchesStore.persist.rehydrate(),
        useTrainingStore.persist.rehydrate(),
      ])
      await checkAndOfferLocalImport(user.id)
      if (!cancelled) setDataReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [session, user])

  if (loading) return <Splash />
  if (!session) return <LoginScreen />
  if (!dataReady) return <Splash />
  return <>{children}</>
}
