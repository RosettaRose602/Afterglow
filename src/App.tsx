import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { AttackMode } from '@/pages/AttackMode'
import { CheckInPage } from '@/pages/CheckInPage'
import { DebriefPage } from '@/pages/DebriefPage'
import { TrackersHub } from '@/pages/TrackersHub'
import { HypaPage } from '@/pages/trackers/HypaPage'
import { ThalmaPage } from '@/pages/trackers/ThalmaPage'
import { GreliPage } from '@/pages/trackers/GreliPage'
import { OsmaPage } from '@/pages/trackers/OsmaPage'
import { DophiPage } from '@/pages/trackers/DophiPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAppStore } from '@/store/appStore'

export default function App() {
  const isAttackMode = useAppStore((s) => s.isAttackMode)

  return (
    <BrowserRouter>
      {isAttackMode ? (
        <Routes>
          <Route path="/attack" element={<AttackMode />} />
          <Route path="/debrief" element={<DebriefPage />} />
          <Route path="*" element={<Navigate to="/attack" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="check-in" element={<CheckInPage />} />
            <Route path="trackers" element={<TrackersHub />} />
            <Route path="trackers/hypa" element={<HypaPage />} />
            <Route path="trackers/thalma" element={<ThalmaPage />} />
            <Route path="trackers/greli" element={<GreliPage />} />
            <Route path="trackers/osma" element={<OsmaPage />} />
            <Route path="trackers/dophi" element={<DophiPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  )
}
