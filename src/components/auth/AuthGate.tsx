import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useClubStore } from '../../store/useClubStore'
import { useMatchesStore } from '../../store/useMatchesStore'
import { useTrainingStore } from '../../store/useTrainingStore'
import { checkAndOfferLocalImport } from '../../lib/importLocalData'
import { migrateClubImagesToStorage } from '../../lib/imageMigration'
import { fetchAppSettings, type AppSettings } from '../../lib/adminApi'
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

function MaintenanceScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 text-center">
      <div>
        <div className="text-4xl mb-3">🛠</div>
        <h1 className="text-[18px] font-black mb-1">التطبيق تحت الصيانة حالياً</h1>
        <p className="text-t2 text-[13px]">نعمل على تحسينات — عاود المحاولة بعد قليل.</p>
      </div>
    </div>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, user, loading, isAdmin } = useAuthStore()
  const [dataReady, setDataReady] = useState(false)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    if (!session || !user) {
      setDataReady(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const [, appSettings] = await Promise.all([
        Promise.all([
          useClubStore.persist.rehydrate(),
          useMatchesStore.persist.rehydrate(),
          useTrainingStore.persist.rehydrate(),
        ]),
        fetchAppSettings(),
      ])
      await checkAndOfferLocalImport(user.id)
      if (!cancelled) {
        setSettings(appSettings)
        setDataReady(true)
      }
      migrateClubImagesToStorage().catch((e) => console.error('[imageMigration] فشل', e))
    })()
    return () => {
      cancelled = true
    }
  }, [session, user])

  if (loading) return <Splash />
  if (!session) return <LoginScreen />
  if (!dataReady) return <Splash />
  if (settings?.maintenance_mode && !isAdmin) return <MaintenanceScreen />

  return (
    <>
      {settings?.announcement && (
        <div className="bg-sec text-white text-[12px] font-bold text-center py-2 px-3">{settings.announcement}</div>
      )}
      {children}
    </>
  )
}
