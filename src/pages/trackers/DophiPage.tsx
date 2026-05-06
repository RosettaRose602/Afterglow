import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { ExerciseEntry, ExerciseIntensity } from '@/types'
import type { DophiEnergyState } from '@/components/mascots/mascotRegistry'

const INTENSITY_OPTIONS: {
  value: ExerciseIntensity
  dophi: DophiEnergyState
  emoji: string
  label: string
  detail: string
  color: string
}[] = [
  { value: 'rest',     dophi: 'rest',          emoji: '🛌', label: 'Rest',         detail: 'No planned activity',       color: 'border-textMuted/30 text-textSecondary' },
  { value: 'light',    dophi: 'low-energy',    emoji: '🚶', label: 'Light',        detail: 'Walking, stretching, yoga', color: 'border-emerald-700/40 text-emerald-400' },
  { value: 'moderate', dophi: 'medium-effort', emoji: '🏃', label: 'Moderate',     detail: 'Jogging, cycling, swimming',color: 'border-amber-700/40 text-amber-400' },
  { value: 'vigorous', dophi: 'energized',     emoji: '⚡', label: 'Vigorous',     detail: 'Running, HIIT, sport',      color: 'border-orange-700/40 text-orange-400' },
]

const DURATION_OPTIONS = [10, 20, 30, 45, 60, 90]

export function DophiPage() {
  const navigate = useNavigate()
  const { exerciseEntries, addExerciseEntry } = useAppStore()
  const [intensity, setIntensity] = useState<ExerciseIntensity | null>(null)
  const [duration, setDuration] = useState<number>(30)
  const [saved, setSaved] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntries = exerciseEntries.filter((e) => e.loggedAt.startsWith(today))

  const selectedOpt = INTENSITY_OPTIONS.find((o) => o.value === intensity)
  const dophiVariant: DophiEnergyState = selectedOpt?.dophi ?? 'rest'

  const handleSave = () => {
    if (!intensity) return
    const entry: ExerciseEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      intensity,
      durationMinutes: duration,
    }
    addExerciseEntry(entry)
    setIntensity(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Dophi — Exercise</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Mascot */}
        <div className="flex items-end gap-4">
          <AnimatedMascot
            mascot="dophi"
            dophiVariant={dophiVariant}
            size={120}
            animation={intensity === 'vigorous' ? 'bounce' : 'float'}
          />
          <div className="card flex-1 p-4 mb-2">
            <p className="text-sm text-textSecondary leading-relaxed">
              {intensity === null
                ? "Even gentle movement helps protect your threshold. No pressure — every little bit counts! 🧡"
                : intensity === 'rest'
                ? "Rest is valid and important. Sometimes doing nothing is the best thing for your body 🌸"
                : intensity === 'light'
                ? "Gentle movement is great for circulation and mood! You're doing amazing 🌿"
                : intensity === 'moderate'
                ? "Steady effort — you've got this! Make sure to hydrate well 💛"
                : "High energy today! Just remember to listen to your body and rest if needed ⚡"}
            </p>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Log exercise</h3>

          <div>
            <label className="label-base">Intensity</label>
            <div className="space-y-2">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntensity(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border transition-all min-h-[56px] text-left',
                    intensity === opt.value
                      ? cn('bg-orange-900/20', opt.color)
                      : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
                  )}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-textMuted">{opt.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">Duration</label>
            <div className="grid grid-cols-6 gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'p-2.5 rounded-xl border text-sm font-semibold transition-all min-h-[44px]',
                    duration === d
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                      : 'border-border bg-surfaceHigh text-textMuted hover:text-textPrimary',
                  )}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={intensity === null}
            className={cn('btn-primary w-full', saved && 'bg-safeGreen')}
          >
            {saved ? '✓ Logged!' : <><Plus size={16} /> Log {intensity ?? 'activity'}</>}
          </button>
        </div>

        {todayEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Today's exercise</h3>
            <div className="space-y-2">
              {todayEntries.map((e) => {
                const opt = INTENSITY_OPTIONS.find((o) => o.value === e.intensity)
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-textMuted">{format(new Date(e.loggedAt), 'h:mm a')}</span>
                    <span className="text-textSecondary">{opt?.emoji} {opt?.label}</span>
                    <span className="text-orange-400 font-medium">{e.durationMinutes}m</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
