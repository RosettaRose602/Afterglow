import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh bg-bg">
      {/* Sidebar — visible only on lg+ */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-dvh lg:ml-64 pb-20 lg:pb-0">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav — visible only below lg */}
      <BottomNav />
    </div>
  )
}
