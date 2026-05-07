import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { format, parseISO, subDays, eachDayOfInterval, differenceInHours } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'

type Tab = 'attacks' | 'threshold' | 'sleep'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#12122a', border: '1px solid #1e1e3a', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#e2e8f0' },
}

export function HistoryPage() {
  const [tab, setTab] = useState<Tab>('attacks')
  const { completedAttacks, checkIns, sleepEntries } = useAppStore()

  // ── Attacks tab data ───────────────────────────────────────────────────────
  // Monthly attack count for last 6 months
  const attacksByMonth: Record<string, number> = {}
  completedAttacks.forEach((a) => {
    const month = format(parseISO(a.startedAt), 'MMM')
    attacksByMonth[month] = (attacksByMonth[month] ?? 0) + 1
  })
  const monthData = Object.entries(attacksByMonth).map(([month, count]) => ({ month, count }))

  // ── Threshold tab data ─────────────────────────────────────────────────────
  const last14 = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
  const thresholdData = last14.map((day) => {
    const key = format(day, 'yyyy-MM-dd')
    const checkIn = checkIns.find((c) => c.date === key)
    return {
      date: format(day, 'MMM d'),
      score: checkIn ? 72 : null, // placeholder — in prod use stored score
    }
  }).filter((d) => d.score !== null)

  // ── Sleep tab data ─────────────────────────────────────────────────────────
  const sleepData = sleepEntries.slice(0, 14).reverse().map((e) => ({
    date: format(parseISO(e.date), 'MMM d'),
    hours: +(e.durationMinutes / 60).toFixed(1),
    quality: e.quality,
  }))

  const avgSleep = sleepEntries.length
    ? (sleepEntries.reduce((sum, e) => sum + e.durationMinutes, 0) / sleepEntries.length / 60).toFixed(1)
    : null

  return (
    <div className="min-h-full">
      <header className="page-header">
        <h1 className="text-xl font-bold text-textPrimary">History</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-textPrimary">{completedAttacks.length}</p>
            <p className="text-[10px] text-textMuted mt-0.5">Attacks tracked</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-textPrimary">{checkIns.length}</p>
            <p className="text-[10px] text-textMuted mt-0.5">Check-ins</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-textPrimary">{avgSleep ?? '—'}</p>
            <p className="text-[10px] text-textMuted mt-0.5">Avg sleep (h)</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-surfaceHigh rounded-xl">
          {(['attacks', 'threshold', 'sleep'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize',
                tab === t ? 'bg-surface text-textPrimary shadow-sm' : 'text-textMuted hover:text-textSecondary',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Attacks tab */}
        {tab === 'attacks' && (
          <div className="space-y-4">
            {monthData.length > 0 ? (
              <div className="card p-4">
                <p className="text-xs text-textMuted mb-3">Attacks by month</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={monthData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={18} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-4xl mb-2">🌟</p>
                <p className="text-sm font-semibold text-textPrimary">No attacks tracked yet</p>
                <p className="text-xs text-textMuted mt-1">When you track an attack, it'll appear here.</p>
              </div>
            )}

            {/* Attack list */}
            {completedAttacks.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-textSecondary mb-3">Recent attacks</h3>
                <div className="space-y-3">
                  {completedAttacks.slice(0, 10).map((a) => {
                    const duration = a.endedAt
                      ? differenceInHours(parseISO(a.endedAt), parseISO(a.startedAt))
                      : null
                    return (
                      <div key={a.id} className="border border-border rounded-xl p-3">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-textPrimary">
                            {format(parseISO(a.startedAt), 'EEE, MMM d')}
                          </p>
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full',
                            a.painLevel >= 8 ? 'bg-dangerRed/15 text-dangerRed'
                            : a.painLevel >= 5 ? 'bg-warningAmber/15 text-warningAmber'
                            : 'bg-safeGreen/15 text-safeGreen',
                          )}>
                            Pain {a.painLevel}/10
                          </span>
                        </div>
                        {duration !== null && (
                          <p className="text-xs text-textMuted">{duration}h duration</p>
                        )}
                        {a.symptoms.length > 0 && (
                          <p className="text-xs text-textMuted mt-1">
                            {a.symptoms.slice(0, 4).join(' · ')}
                            {a.symptoms.length > 4 && ` +${a.symptoms.length - 4} more`}
                          </p>
                        )}
                        {a.attackStory && (
                          <p className="text-xs text-textSecondary mt-2 leading-relaxed line-clamp-2">
                            {a.attackStory}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Threshold tab */}
        {tab === 'threshold' && (
          <div className="space-y-4">
            {checkIns.length >= 2 ? (
              <div className="card p-4">
                <p className="text-xs text-textMuted mb-3">Threshold score — last 14 days</p>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={thresholdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} interval={1} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} width={24} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-4xl mb-2">💜</p>
                <p className="text-sm font-semibold text-textPrimary">Complete more check-ins</p>
                <p className="text-xs text-textMuted mt-1">Your threshold trend will appear after 2+ daily check-ins.</p>
              </div>
            )}

            {/* Recent check-ins */}
            {checkIns.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-textSecondary mb-3">Recent check-ins</h3>
                <div className="space-y-2">
                  {checkIns.slice(0, 7).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                      <span className="text-textMuted text-xs">{format(new Date(c.date), 'EEE, MMM d')}</span>
                      <div className="flex gap-3 text-xs text-textMuted">
                        <span>Mood {c.mood}/5</span>
                        <span>Stress {c.stress}/5</span>
                        <span>Energy {c.energy}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sleep tab */}
        {tab === 'sleep' && (
          <div className="space-y-4">
            {sleepData.length >= 2 ? (
              <div className="card p-4">
                <p className="text-xs text-textMuted mb-3">Sleep hours — last 14 nights</p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={sleepData}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} interval={1} />
                    <YAxis domain={[0, 12]} tick={{ fontSize: 9, fill: '#64748b' }} width={18} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}
                      fill="#6366f1"
                      label={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 flex items-center justify-between text-xs text-textMuted">
                  <span>Avg: {avgSleep}h</span>
                  <span className={cn(avgSleep && +avgSleep < 7 ? 'text-warningAmber' : 'text-safeGreen')}>
                    {avgSleep && +avgSleep < 7 ? 'Below 7h target' : '7h+ target met'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-4xl mb-2">😴</p>
                <p className="text-sm font-semibold text-textPrimary">Log more sleep</p>
                <p className="text-xs text-textMuted mt-1">Sleep trends appear after 2+ entries in Thalma.</p>
              </div>
            )}

            {sleepEntries.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-textSecondary mb-3">Recent sleep</h3>
                <div className="space-y-2">
                  {sleepEntries.slice(0, 7).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                      <span className="text-textMuted text-xs">{format(parseISO(e.date), 'EEE, MMM d')}</span>
                      <div className="flex gap-3 text-xs">
                        <span className={cn(e.durationMinutes < 420 ? 'text-warningAmber' : 'text-textSecondary')}>
                          {(e.durationMinutes / 60).toFixed(1)}h
                        </span>
                        <span className="text-textMuted">Quality {e.quality}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
