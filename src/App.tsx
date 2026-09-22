import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useClubStore } from './store/useClubStore'
import { useAuthStore } from './store/useAuthStore'
import { AuthGate } from './components/auth/AuthGate'
import { TabLayout } from './components/layout/TabLayout'
import { HomeScreen } from './components/home/HomeScreen'
import { SetupScreen } from './components/setup/SetupScreen'
import { StartScheduledMatchScreen } from './components/setup/StartScheduledMatchScreen'
import { LiveScreen } from './components/live/LiveScreen'
import { ReportScreen } from './components/report/ReportScreen'
import { ReportsListScreen } from './components/reports/ReportsListScreen'
import { ResultsScreen } from './components/results/ResultsScreen'
import { AnalyticsScreen } from './components/analytics/AnalyticsScreen'
import { StandingsScreen } from './components/standings/StandingsScreen'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { ScoutingReportScreen } from './components/scouting/ScoutingReportScreen'
import { TrainingListScreen } from './components/training/TrainingListScreen'
import { NewTrainingScreen } from './components/training/NewTrainingScreen'
import { TrainingSessionScreen } from './components/training/TrainingSessionScreen'
import { PublicLiveScoreScreen } from './components/live-public/PublicLiveScoreScreen'
import { AdminScreen } from './components/admin/AdminScreen'
import { RulesScreen } from './components/rules/RulesScreen'

function App() {
  return (
    <Routes>
      {/* رابط عام لمتابعة النتيجة لحظياً — بلا تسجيل دخول، يبقى خارج AuthGate عمداً */}
      <Route path="/live/:matchId" element={<PublicLiveScoreScreen />} />
      <Route path="*" element={<AuthGate><AuthenticatedApp /></AuthGate>} />
    </Routes>
  )
}

function AuthenticatedApp() {
  const colors = useClubStore((s) => s.colors)
  const { isAdmin } = useAuthStore()

  useEffect(() => {
    document.documentElement.style.setProperty('--color-pri', colors.pri)
    document.documentElement.style.setProperty('--color-sec', colors.sec)
  }, [colors])

  /** حساب المطوّر منفصل تماماً — لا يصل أبداً لواجهة النادي/المشترك، بلا استثناء */
  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<TabLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/reports" element={<ReportsListScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/standings" element={<StandingsScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/training" element={<TrainingListScreen />} />
      </Route>
      <Route path="/match/new" element={<SetupScreen />} />
      <Route path="/match/:id/start" element={<StartScheduledMatchScreen />} />
      <Route path="/match/:id/live" element={<LiveScreen />} />
      <Route path="/match/:id/report" element={<ReportScreen />} />
      <Route path="/scouting/:presetId" element={<ScoutingReportScreen />} />
      <Route path="/training/new" element={<NewTrainingScreen />} />
      <Route path="/training/:id" element={<TrainingSessionScreen />} />
      <Route path="/rules" element={<RulesScreen />} />
    </Routes>
  )
}

export default App
