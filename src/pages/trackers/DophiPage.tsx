import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import type { ExerciseEntry, ExerciseIntensity } from '@/types'

const ACTIVITY_TYPES = ['Walk', 'Run', 'Yoga', 'Stretching', 'Weights', 'Bodyweight', 'Swimming', 'Cycling', 'Dance', 'Other']

const INTENSITY_OPTIONS: { value: ExerciseIntensity; label: string; emoji: string; color: string }[] = [
  { value: 'rest',     label: 'Rest',     emoji: '🛌', color: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-400' },
  { value: 'light',    label: 'Light',    emoji: '🚶', color: 'border-safeGreen/40 bg-safeGreen/10 text-safeGreen' },
  { value: 'moderate', label: 'Moderate', emoji: '🏃', color: 'border-warningAmber/40 bg-warningAmber/10 text-warningAmber' },
  { value: 'vigorous', label: 'Vigorous', emoji: '⚡', color: 'border-dangerRed/40 bg-dangerRed/10 text-dangerRed' },
]

// Recommendation based on threshold + cycle
function getDophiRecommendation(zone: string, cyclePhase: string): {
  tier: string; color: string; description: string; emoji: string
} {
  if (zone === 'danger') {
    return { tier: 'Rest Day', color: 'text-dangerRed', emoji: '🛌', description: 'Your threshold is very low. Movement may spike it further — rest is the best medicine today.' }
  }
  if (zone === 'warning') {
    return { tier: 'Gentle Day', color: 'text-warningAmber', emoji: '🌿', description: 'Gentle movement only — a short walk, stretching, or restorative yoga. No pushing through.' }
  }
  if (cyclePhase === 'menstrual' || cyclePhase === 'luteal') {
    return { tier: 'Moderate Day', color: 'text-accentIce', emoji: '🚶', description: `${cyclePhase === 'menstrual' ? 'Menstrual' : 'Luteal'} phase — lower intensity than peak. Listen to your body and back off if needed.` }
  }
  return { tier: 'Full Workout Day', color: 'text-safeGreen', emoji: '🏃', description: 'Threshold is protected and you\'re in a good cycle phase. Enjoy your full workout!' }
}

export function DophiPage() {
  const navigate = useNavigate()
  const { exerciseEntries, addExerciseEntry, threshold, cyclePhase } = useAppStore()

  const [activityType, setActivityType] = useState<string>('Walk')
  const [intensity, setIntensity] = useState<ExerciseIntensity | null>(null)
  const [duration, setDuration] = useState(30)
  const [saved, setSaved] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntries = exerciseEntries
    .filter((e) => e.loggedAt.startsWith(today))
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())

  const rec = getDophiRecommendation(threshold.zone, cyclePhase)

  function handleSave() {
    if (!intensity) return
    const entry: ExerciseEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      intensity,
      durationMinutes: duration,
      type: activityType,
    }
    addExerciseEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setIntensity(null)
  }

  // Pick the right Dophi variant based on recommendation
  const dophiVariant =
    rec.tier === 'Rest Day' ? 'rest' as const
    : rec.tier === 'Gentle Day' ? 'low-energy' as const
    : rec.tier === 'Moderate Day' ? 'medium-effort' as const
    : 'energized' as const

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Dophi — Movement</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Today's recommendation */}
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="dophi" dophiVariant={dophiVariant} animation="bounce" size={110} />
          <div className="card flex-1 p-4 mb-2">
            <p className={cn('text-xs font-semibold uppercase tracking-wide mb-0.5', rec.color)}>
              {rec.emoji} {rec.tier}
            </p>
            <p className="text-sm text-textSecondary leading-snug">{rec.description}</p>
          </div>
        </div>

        {/* Recommendation detail card */}
        <div className={cn(
          'card p-4 border',
          rec.tier === 'Rest Day' ? 'border-dangerRed/20 bg-dangerRed/5'
          : rec.tier === 'Gentle Day' ? 'border-warningAmber/20 bg-warningAmber/5'
          : rec.tier === 'Moderate Day' ? 'border-accentIce/20 bg-accentIce/5'
          : 'border-safeGreen/20 bg-safeGreen/5',
        )}>
          <p className={cn('text-sm font-bold mb-1', rec.color)}>Today: {rec.tier}</p>
          <p className="text-xs text-textSecondary">
            Threshold: <span className={cn(
              'font-semibold',
              threshold.zone === 'safe' ? 'text-safeGreen' : threshold.zone === 'warning' ? 'text-warningAmber' : 'text-dangerRed',
            )}>{threshold.zone}</span>
            {' · '}Cycle: <span className="font-semibold text-pink-400 capitalize">{cyclePhase}</span>
          </p>
        </div>

        {/* Log exercise */}
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Log exercise</h3>

          <div>
            <label className="label-base">Activity</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setActivityType(t)}
                  className={cn(
                    'px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                    activityType === t
                      ? 'border-accentGold/50 bg-accentGold/15 text-accentGold'
                      : 'border-border bg-surfaceHigh text-textMuted',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">Intensity</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntensity(opt.value)}
                  className={cn(
                    'flex items-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all min-h-[48px]',
                    intensity === opt.value ? opt.color : 'border-border bg-surfaceHigh text-textMuted',
                  )}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">Duration: {duration} min</label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full mt-2 accent-accentGold"
            />
            <div className="flex justify-between text-[10px] text-textMuted">
              <span>5m</span><span>30m</span><span>60m</span><span>120m</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!intensity}
            className={cn('btn-primary w-full', !intensity && 'opacity-40 cursor-not-allowed', saved && '!bg-safeGreen')}
          >
            {saved ? '✓ Logged' : 'Log exercise'}
          </button>
        </div>

        {/* Today's entries */}
        {todayEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Today's activity</h3>
            <div className="space-y-2">
              {todayEntries.map((e) => {
                const opt = INTENSITY_OPTIONS.find((o) => o.value === e.intensity)
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{opt?.emoji}</span>
                      <span className="text-textSecondary">{e.type ?? 'Exercise'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <span>{e.durationMinutes}m</span>
                      <span className="capitalize">{e.intensity}</span>
                    </div>
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
