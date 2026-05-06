import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function HistoryPage() {
  const { cycleEntries, sleepEntries, hydrationEntries, exerciseEntries, nourishmentEntries } = useAppStore()

  const totalSleep = sleepEntries.reduce((s, e) => s + e.durationMinutes, 0)
  const avgSleep = sleepEntries.length ? Math.round(totalSleep / sleepEntries.length) : 0
  const totalHydration = hydrationEntries.reduce((s, e) => s + e.amountMl, 0)

  const stats = [
    { label: 'Sleep entries', value: sleepEntries.length, icon: '🌙', color: 'text-indigo-400' },
    { label: 'Avg sleep', value: `${(avgSleep / 60).toFixed(1)}h`, icon: '⏱️', color: 'text-violet-400' },
    { label: 'Hydration logs', value: hydrationEntries.length, icon: '💧', color: 'text-sky-400' },
    { label: 'Total water', value: `${(totalHydration / 1000).toFixed(1)}L`, icon: '🫧', color: 'text-cyan-400' },
    { label: 'Cycle logs', value: cycleEntries.length, icon: '🌸', color: 'text-rose-400' },
    { label: 'Exercise logs', value: exerciseEntries.length, icon: '⚡', color: 'text-orange-400' },
  ]

  return (
    <div className="min-h-full">
      <header className="page-header">
        <h1 className="text-2xl font-bold text-textPrimary">History</h1>
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="card p-3 text-center">
              <span className="text-2xl">{icon}</span>
              <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
              <p className="text-[10px] text-textMuted mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent sleep */}
        {sleepEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Recent Sleep</h3>
            <div className="space-y-2">
              {sleepEntries.slice(0, 7).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-textMuted">{format(new Date(e.date), 'EEE, MMM d')}</span>
                  <span className="text-textSecondary">{(e.durationMinutes / 60).toFixed(1)}h</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={cn('text-xs', i < e.quality ? 'text-indigo-400' : 'text-textMuted')}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent cycle */}
        {cycleEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Recent Cycle Logs</h3>
            <div className="space-y-2">
              {cycleEntries.slice(0, 7).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-textMuted">{format(new Date(e.date), 'EEE, MMM d')}</span>
                  <span className="text-textSecondary capitalize">{e.flow ?? 'No flow'}</span>
                  <span className="text-rose-400 text-xs">{e.symptoms.length > 0 ? `${e.symptoms.length} symptoms` : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent exercise */}
        {exerciseEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Recent Exercise</h3>
            <div className="space-y-2">
              {exerciseEntries.slice(0, 7).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-textMuted">{format(new Date(e.loggedAt), 'EEE, MMM d')}</span>
                  <span className="text-textSecondary capitalize">{e.intensity}</span>
                  <span className="text-orange-400">{e.durationMinutes}m</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cycleEntries.length === 0 && sleepEntries.length === 0 && exerciseEntries.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-textSecondary">No history yet — start logging in the Trackers tab!</p>
          </div>
        )}
      </div>
    </div>
  )
}
