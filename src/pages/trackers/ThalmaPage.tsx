import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { getMoonPhase } from '@/lib/moonPhase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { SleepEntry } from '@/types'

const QUALITY_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Fair' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Great' },
] as const

export function ThalmaPage() {
  const navigate = useNavigate()
  const { sleepEntries, addSleepEntry, moonPhaseCache } = useAppStore()
  const moonInfo = getMoonPhase()
  const moonPhase = moonPhaseCache?.phase ?? moonInfo.phase

  const [bedtime, setBedtime] = useState('23:00')
  const [waketime, setWaketime] = useState('07:00')
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [saved, setSaved] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntry = sleepEntries.find((e) => e.date === today)

  function getDurationMinutes(bed: string, wake: string): number {
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let bedMins = bh * 60 + bm
    let wakeMins = wh * 60 + wm
    if (wakeMins <= bedMins) wakeMins += 24 * 60
    return wakeMins - bedMins
  }

  const durationMins = getDurationMinutes(bedtime, waketime)
  const durationHours = (durationMins / 60).toFixed(1)

  const handleSave = () => {
    const now = new Date()
    const entry: SleepEntry = {
      id: crypto.randomUUID(),
      date: today,
      bedtimeAt: `${today}T${bedtime}:00`,
      wakeAt: `${today}T${waketime}:00`,
      durationMinutes: durationMins,
      quality: quality ?? 3,
    }
    addSleepEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Thalma — Sleep</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Moon phase + mascot */}
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="thalma" moonPhase={moonPhase} size={120} animation="float" />
          <div className="card flex-1 p-4 mb-2">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-1">Tonight's moon</p>
            <p className="font-bold text-textPrimary capitalize">{moonPhase.replace(/-/g, ' ')}</p>
            <p className="text-xs text-textMuted mt-1">{moonInfo.subtitle}</p>
            <p className="text-xs text-textMuted mt-1">Illumination: {Math.round(moonInfo.illumination * 100)}%</p>
          </div>
        </div>

        {/* Sleep log form */}
        {!todayEntry ? (
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-textPrimary">Log last night's sleep</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Wake time</label>
                <input
                  type="time"
                  value={waketime}
                  onChange={(e) => setWaketime(e.target.value)}
                  className="input-base"
                />
              </div>
            </div>

            <div className="card-elevated p-3 text-center">
              <p className="text-2xl font-bold text-textPrimary">{durationHours}h</p>
              <p className="text-xs text-textMuted">{durationMins} minutes of sleep</p>
            </div>

            <div>
              <label className="label-base">Sleep quality</label>
              <div className="grid grid-cols-5 gap-2">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuality(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all min-h-[52px]',
                      quality === opt.value
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                        : 'border-border bg-surfaceHigh text-textMuted hover:text-textPrimary',
                    )}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className={cn('btn-primary w-full', saved && 'bg-safeGreen')}
            >
              {saved ? '✓ Saved' : 'Save sleep log'}
            </button>
          </div>
        ) : (
          <div className="card p-4 border-safeGreen/20">
            <p className="text-sm font-semibold text-safeGreen">✓ Sleep logged today</p>
            <p className="text-xs text-textMuted mt-1">
              {(todayEntry.durationMinutes / 60).toFixed(1)}h — Quality {todayEntry.quality}/5
            </p>
          </div>
        )}

        {/* Recent sleep */}
        {sleepEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Recent sleep</h3>
            <div className="space-y-2">
              {sleepEntries.slice(0, 7).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-textMuted">{format(new Date(e.date), 'EEE, MMM d')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-textSecondary">{(e.durationMinutes / 60).toFixed(1)}h</span>
                    <span className="text-textMuted">{QUALITY_OPTIONS.find((q) => q.value === e.quality)?.emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
