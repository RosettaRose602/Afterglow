import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { format } from 'date-fns'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import type { DailyCheckIn, SleepEntry } from '@/types'

// ─── Scale helpers ────────────────────────────────────────────────────────────

type Scale5 = 1 | 2 | 3 | 4 | 5

function ScaleButtons({
  value,
  onChange,
  options,
}: {
  value: Scale5 | null
  onChange: (v: Scale5) => void
  options: { value: Scale5; emoji: string; label: string }[]
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all min-h-[56px]',
            value === opt.value
              ? 'border-accentViolet bg-accentViolet/15 text-accentViolet'
              : 'border-border bg-surfaceHigh text-textMuted hover:text-textPrimary',
          )}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

function YesNoButtons({
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: {
  value: boolean | null
  onChange: (v: boolean) => void
  yesLabel?: string
  noLabel?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onChange(true)}
        className={cn(
          'p-4 rounded-xl border text-sm font-semibold transition-all min-h-[56px]',
          value === true
            ? 'border-warningAmber bg-warningAmber/15 text-warningAmber'
            : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
        )}
      >
        {yesLabel}
      </button>
      <button
        onClick={() => onChange(false)}
        className={cn(
          'p-4 rounded-xl border text-sm font-semibold transition-all min-h-[56px]',
          value === false
            ? 'border-safeGreen bg-safeGreen/15 text-safeGreen'
            : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
        )}
      >
        {noLabel}
      </button>
    </div>
  )
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const MOOD_OPTIONS: { value: Scale5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😭', label: 'Awful' },
  { value: 2, emoji: '😟', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

const STRESS_OPTIONS: { value: Scale5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😌', label: 'None' },
  { value: 2, emoji: '🙂', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Some' },
  { value: 4, emoji: '😤', label: 'High' },
  { value: 5, emoji: '😩', label: 'A lot' },
]

const ENERGY_OPTIONS: { value: Scale5; emoji: string; label: string }[] = [
  { value: 1, emoji: '🪫', label: 'Empty' },
  { value: 2, emoji: '😴', label: 'Tired' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '⚡', label: 'Great' },
]

const STIFFNESS_OPTIONS: { value: Scale5; emoji: string; label: string }[] = [
  { value: 1, emoji: '✅', label: 'None' },
  { value: 2, emoji: '🙂', label: 'Mild' },
  { value: 3, emoji: '😐', label: 'Some' },
  { value: 4, emoji: '😬', label: 'Stiff' },
  { value: 5, emoji: '😣', label: 'Tight' },
]

const SENSITIVITY_OPTIONS: { value: Scale5; emoji: string; label: string }[] = [
  { value: 1, emoji: '✅', label: 'None' },
  { value: 2, emoji: '🙂', label: 'Tiny' },
  { value: 3, emoji: '😐', label: 'Some' },
  { value: 4, emoji: '😬', label: 'High' },
  { value: 5, emoji: '😵', label: 'A lot' },
]

const QUALITY_OPTIONS: { value: Scale5; emoji: string; label: string }[] = [
  { value: 1, emoji: '😫', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Fair' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Great' },
]

// ─── Draft state ─────────────────────────────────────────────────────────────

interface Draft {
  // Step 1 — Sleep
  sleepBedtime: string
  sleepWake: string
  sleepQuality: Scale5 | null
  // Step 2 — Feelings
  mood: Scale5 | null
  stress: Scale5 | null
  energy: Scale5 | null
  // Step 3 — Body
  neckStiffness: Scale5 | null
  // Step 4 — Sensitivities
  lightSensitivity: Scale5 | null
  soundSensitivity: Scale5 | null
  weatherSensitivity: Scale5 | null
  // Step 5 — Prodrome
  foodCravings: boolean | null
  excessiveYawning: boolean | null
  visionChanges: boolean | null
  nausea: boolean | null
  // Step 6 — Hydration
  hydrationGlasses: number | null
  // Step 7 — Notes
  notes: string
}

// ─── Slide animation ─────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ─── Main component ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 7

export function CheckInFlow() {
  const navigate = useNavigate()
  const { addCheckIn, addSleepEntry, sleepEntries, threshold } = useAppStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todaySleep = sleepEntries.find((s) => s.date === today)

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState(false)

  const [draft, setDraft] = useState<Draft>({
    sleepBedtime: '23:00',
    sleepWake: '07:00',
    sleepQuality: null,
    mood: null,
    stress: null,
    energy: null,
    neckStiffness: null,
    lightSensitivity: null,
    soundSensitivity: null,
    weatherSensitivity: null,
    foodCravings: null,
    excessiveYawning: null,
    visionChanges: null,
    nausea: null,
    hydrationGlasses: null,
    notes: '',
  })

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function getDurationMinutes(bed: string, wake: string): number {
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let bedMins = bh * 60 + bm
    let wakeMins = wh * 60 + wm
    if (wakeMins <= bedMins) wakeMins += 24 * 60
    return wakeMins - bedMins
  }

  function goNext() {
    if (step < TOTAL_STEPS - 1) {
      setDir(1)
      setStep((s) => s + 1)
    } else {
      handleSave()
    }
  }

  function goBack() {
    if (step > 0) {
      setDir(-1)
      setStep((s) => s - 1)
    }
  }

  function handleSave() {
    // Save sleep if not already logged today and quality was set
    if (!todaySleep && draft.sleepQuality !== null) {
      const durationMinutes = getDurationMinutes(draft.sleepBedtime, draft.sleepWake)
      const entry: SleepEntry = {
        id: crypto.randomUUID(),
        date: today,
        bedtimeAt: `${today}T${draft.sleepBedtime}:00`,
        wakeAt: `${today}T${draft.sleepWake}:00`,
        durationMinutes,
        quality: draft.sleepQuality,
      }
      addSleepEntry(entry)
    }

    // Save check-in
    const checkIn: DailyCheckIn = {
      id: crypto.randomUUID(),
      date: today,
      mood: draft.mood ?? 3,
      stress: draft.stress ?? 2,
      energy: draft.energy ?? 3,
      neckStiffness: draft.neckStiffness ?? undefined,
      lightSensitivity: draft.lightSensitivity ?? undefined,
      soundSensitivity: draft.soundSensitivity ?? undefined,
      weatherSensitivity: draft.weatherSensitivity ?? undefined,
      foodCravings: draft.foodCravings ?? undefined,
      excessiveYawning: draft.excessiveYawning ?? undefined,
      visionChanges: draft.visionChanges ?? undefined,
      nausea: draft.nausea ?? undefined,
      hydrationGlasses: draft.hydrationGlasses ?? undefined,
      notes: draft.notes || undefined,
    }
    addCheckIn(checkIn)
    setDone(true)
  }

  const cereIntensity =
    threshold.zone === 'safe' ? 'calm' : threshold.zone === 'warning' ? 'pulsing' : 'alert'

  // ── Completed screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-center">
        <AnimatedMascot mascot="cere" animation="float" intensity={cereIntensity} size={140} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-textPrimary">Check-in complete!</h2>
          <div className="card p-5 max-w-xs mx-auto">
            <p className="text-4xl font-bold text-textPrimary mb-1">
              {threshold.score}<span className="text-xl text-textMuted font-normal">%</span>
            </p>
            <p className={cn(
              'text-sm font-semibold capitalize',
              threshold.zone === 'safe' ? 'text-safeGreen' :
              threshold.zone === 'warning' ? 'text-warningAmber' : 'text-dangerRed',
            )}>
              {threshold.zone === 'safe' ? 'Threshold protected' :
               threshold.zone === 'warning' ? 'Watch your threshold' : 'High migraine risk'}
            </p>
          </div>
          <p className="text-sm text-textMuted max-w-xs">
            {threshold.zone === 'safe'
              ? "You're doing great — your threshold looks solid today."
              : threshold.zone === 'warning'
              ? "Your threshold is getting lower. Rest, hydrate, and take it easy."
              : "Your threshold is quite low. Please rest and reduce stimulation."}
          </p>
          <button onClick={() => navigate('/')} className="btn-primary px-10 mt-2">
            Back to dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Step content ──────────────────────────────────────────────────────────
  const steps = [
    // Step 0 — Sleep
    <StepSleep
      key="sleep"
      todaySleep={todaySleep ?? null}
      draft={draft}
      set={set}
    />,
    // Step 1 — Feelings
    <StepFeelings key="feelings" draft={draft} set={set} />,
    // Step 2 — Body
    <StepBody key="body" draft={draft} set={set} />,
    // Step 3 — Sensitivities
    <StepSensitivities key="sens" draft={draft} set={set} />,
    // Step 4 — Prodrome
    <StepProdrome key="prodrome" draft={draft} set={set} />,
    // Step 5 — Hydration
    <StepHydration key="hydration" draft={draft} set={set} />,
    // Step 6 — Notes
    <StepNotes key="notes" draft={draft} set={set} />,
  ]

  const stepTitles = [
    'Sleep', 'How are you feeling?', 'Body check',
    'Sensitivities', 'Any signals?', 'Hydration', 'Anything else?',
  ]

  const canProceed = [
    true, // sleep — always ok (can skip)
    draft.mood !== null && draft.stress !== null && draft.energy !== null,
    draft.neckStiffness !== null,
    draft.lightSensitivity !== null && draft.soundSensitivity !== null,
    draft.foodCravings !== null && draft.excessiveYawning !== null,
    true, // hydration — always ok
    true, // notes — always ok
  ]

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="page-header">
        <button
          onClick={step === 0 ? () => navigate(-1) : goBack}
          className="btn-ghost p-2 -ml-2 min-h-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-textMuted uppercase tracking-wide">Daily check-in</p>
          <p className="text-sm font-semibold text-textPrimary">{stepTitles[step]}</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-1.5 bg-surfaceHigh rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accentViolet to-indigo-400 rounded-full"
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-[10px] text-textMuted mt-1 text-right">{step + 1} / {TOTAL_STEPS}</p>
      </div>

      {/* Step */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="h-full"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 pt-2 border-t border-border">
        <button
          onClick={goNext}
          disabled={!canProceed[step]}
          className={cn(
            'btn-primary w-full flex items-center justify-center gap-2',
            !canProceed[step] && 'opacity-40 cursor-not-allowed',
          )}
        >
          {step === TOTAL_STEPS - 1 ? (
            <><Check size={16} /> Save check-in</>
          ) : (
            <>Next <ChevronRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepSleep({
  todaySleep,
  draft,
  set,
}: {
  todaySleep: SleepEntry | null
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  const durationMins = (() => {
    const [bh, bm] = draft.sleepBedtime.split(':').map(Number)
    const [wh, wm] = draft.sleepWake.split(':').map(Number)
    let b = bh * 60 + bm
    let w = wh * 60 + wm
    if (w <= b) w += 24 * 60
    return w - b
  })()

  if (todaySleep) {
    return (
      <div className="space-y-4 pt-2">
        <div className="card p-4 border-safeGreen/20">
          <p className="text-sm font-semibold text-safeGreen mb-1">✓ Sleep already logged</p>
          <p className="text-sm text-textSecondary">
            {(todaySleep.durationMinutes / 60).toFixed(1)}h — Quality {todaySleep.quality}/5
          </p>
        </div>
        <p className="text-xs text-textMuted text-center">Tap Next to continue your check-in.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-textSecondary">How did you sleep last night?</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-base">Bedtime</label>
          <input
            type="time"
            value={draft.sleepBedtime}
            onChange={(e) => set('sleepBedtime', e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">Wake time</label>
          <input
            type="time"
            value={draft.sleepWake}
            onChange={(e) => set('sleepWake', e.target.value)}
            className="input-base"
          />
        </div>
      </div>

      <div className="card-elevated p-3 text-center">
        <p className="text-2xl font-bold text-textPrimary">{(durationMins / 60).toFixed(1)}h</p>
        <p className="text-xs text-textMuted">sleep duration</p>
      </div>

      <div>
        <label className="label-base">Sleep quality</label>
        <ScaleButtons
          value={draft.sleepQuality}
          onChange={(v) => set('sleepQuality', v)}
          options={QUALITY_OPTIONS}
        />
      </div>

      <p className="text-xs text-textMuted text-center">Sleep is optional — tap Next to skip.</p>
    </div>
  )
}

function StepFeelings({
  draft,
  set,
}: {
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label className="label-base">How's your mood?</label>
        <ScaleButtons value={draft.mood} onChange={(v) => set('mood', v)} options={MOOD_OPTIONS} />
      </div>
      <div>
        <label className="label-base">Stress level?</label>
        <ScaleButtons value={draft.stress} onChange={(v) => set('stress', v)} options={STRESS_OPTIONS} />
      </div>
      <div>
        <label className="label-base">Energy level?</label>
        <ScaleButtons value={draft.energy} onChange={(v) => set('energy', v)} options={ENERGY_OPTIONS} />
      </div>
    </div>
  )
}

function StepBody({
  draft,
  set,
}: {
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-textSecondary">
        Neck and shoulder tension is often an early migraine signal.
      </p>
      <div>
        <label className="label-base">Neck / shoulder stiffness?</label>
        <ScaleButtons
          value={draft.neckStiffness}
          onChange={(v) => set('neckStiffness', v)}
          options={STIFFNESS_OPTIONS}
        />
      </div>
    </div>
  )
}

function StepSensitivities({
  draft,
  set,
}: {
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label className="label-base">Light more bothersome than usual?</label>
        <ScaleButtons
          value={draft.lightSensitivity}
          onChange={(v) => set('lightSensitivity', v)}
          options={SENSITIVITY_OPTIONS}
        />
      </div>
      <div>
        <label className="label-base">Sound sensitivity?</label>
        <ScaleButtons
          value={draft.soundSensitivity}
          onChange={(v) => set('soundSensitivity', v)}
          options={SENSITIVITY_OPTIONS}
        />
      </div>
      <div>
        <label className="label-base">Weather making you feel off?</label>
        <ScaleButtons
          value={draft.weatherSensitivity}
          onChange={(v) => set('weatherSensitivity', v)}
          options={SENSITIVITY_OPTIONS}
        />
      </div>
    </div>
  )
}

function StepProdrome({
  draft,
  set,
}: {
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-textSecondary">
        These are common signals that a migraine may be building — even hours before pain starts.
      </p>
      <div>
        <label className="label-base">Stronger food cravings than usual?</label>
        <YesNoButtons value={draft.foodCravings} onChange={(v) => set('foodCravings', v)} />
      </div>
      <div>
        <label className="label-base">Yawning a lot?</label>
        <YesNoButtons value={draft.excessiveYawning} onChange={(v) => set('excessiveYawning', v)} />
      </div>
      <div>
        <label className="label-base">Any vision changes? (zigzags, blind spots, blurry)</label>
        <YesNoButtons
          value={draft.visionChanges}
          onChange={(v) => set('visionChanges', v)}
          yesLabel="Yes — something's off"
          noLabel="Nope, clear"
        />
      </div>
      <div>
        <label className="label-base">Nausea?</label>
        <YesNoButtons value={draft.nausea} onChange={(v) => set('nausea', v)} />
      </div>
    </div>
  )
}

function StepHydration({
  draft,
  set,
}: {
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  const glasses = draft.hydrationGlasses ?? 0
  const options = [0, 1, 2, 3, 4, 5, 6, 8]

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm text-textSecondary">
        Dehydration is one of the most common migraine triggers. You can skip this if you've logged
        drinks in Osma today.
      </p>
      <div>
        <label className="label-base">Glasses of water today (roughly)?</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => set('hydrationGlasses', n)}
              className={cn(
                'p-3 rounded-xl border text-sm font-semibold transition-all min-h-[48px]',
                glasses === n && draft.hydrationGlasses !== null
                  ? 'border-accentIce bg-accentIce/15 text-accentIce'
                  : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
              )}
            >
              {n === 0 ? 'None' : `${n} 💧`}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-textMuted text-center">Tap Next to skip hydration.</p>
    </div>
  )
}

function StepNotes({
  draft,
  set,
}: {
  draft: Draft
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-textSecondary">
        Anything else worth noting today? Stress, unusual events, anything you want Cere to know.
        Totally optional.
      </p>
      <textarea
        value={draft.notes}
        onChange={(e) => set('notes', e.target.value)}
        placeholder="Optional notes..."
        rows={5}
        className="input-base resize-none"
      />
      <p className="text-xs text-textMuted text-center">Tap "Save check-in" to finish.</p>
    </div>
  )
}
