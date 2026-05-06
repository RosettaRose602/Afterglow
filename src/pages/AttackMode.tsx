import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { useERWarning } from '@/hooks/useERWarning'
import { ERWarningBanner } from '@/components/er-warning/ERWarningBanner'
import { cn } from '@/lib/utils'

type AttackStep =
  | 'welcome'
  | 'pain-level'
  | 'pain-side'
  | 'symptoms'
  | 'take-meds'
  | 'environment'
  | 'track-progress'

interface PainLevel {
  level: number
  emoji: string
  label: string
  color: string
}

const PAIN_LEVELS: PainLevel[] = [
  { level: 1,  emoji: '😐', label: '1 — Noticeable',  color: '#4caf8a' },
  { level: 2,  emoji: '😕', label: '2 — Mild',         color: '#6ab870' },
  { level: 3,  emoji: '😣', label: '3 — Uncomfortable',color: '#90b850' },
  { level: 4,  emoji: '😖', label: '4 — Moderate',     color: '#c0a840' },
  { level: 5,  emoji: '😤', label: '5 — Significant',  color: '#e0943a' },
  { level: 6,  emoji: '😩', label: '6 — Intense',      color: '#e07030' },
  { level: 7,  emoji: '🤢', label: '7 — Very severe',  color: '#d85020' },
  { level: 8,  emoji: '🤯', label: '8 — Debilitating', color: '#c83020' },
  { level: 9,  emoji: '😱', label: '9 — Excruciating', color: '#b82020' },
  { level: 10, emoji: '🆘', label: '10 — ER level',    color: '#e05a5a' },
]

const SYMPTOMS = [
  { id: 'nausea',         emoji: '🤢', label: 'Nausea' },
  { id: 'vomiting',       emoji: '🤮', label: 'Vomiting' },
  { id: 'light-sensitive',emoji: '💡', label: 'Light sensitivity' },
  { id: 'sound-sensitive',emoji: '🔊', label: 'Sound sensitivity' },
  { id: 'aura',           emoji: '✨', label: 'Aura / visual' },
  { id: 'weakness',       emoji: '💪', label: 'One-sided weakness' },
  { id: 'speech',         emoji: '💬', label: 'Speech difficulty' },
  { id: 'balance',        emoji: '🌀', label: 'Balance / wobble' },
  { id: 'confusion',      emoji: '🧠', label: 'Confusion / fog' },
  { id: 'neck-stiff',     emoji: '🔒', label: 'Neck stiffness' },
  { id: 'vision',         emoji: '👁️', label: 'Vision changes' },
  { id: 'tremors',        emoji: '〰️', label: 'Tremors' },
]

const ER_SYMPTOMS = ['weakness', 'speech', 'vision', 'neck-stiff', 'tremors']

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-6">
      <AnimatedMascot mascot="bella" animation="breathe" size={180} />
      <div>
        <h2 className="text-2xl font-bold text-textPrimary mb-3">I'm here with you</h2>
        <p className="text-textSecondary leading-relaxed max-w-sm">
          You're safe. We'll take this one step at a time.
          I'll help you track what's happening and guide you through relief steps.
        </p>
      </div>
      <button onClick={onNext} className="btn-primary w-full max-w-sm text-lg py-4">
        Let's start
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

function PainLevelStep({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: number | null
  onChange: (v: number) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <AnimatedMascot mascot="bella" animation="breathe" size={80} />
        <p className="text-textSecondary">How much pain are you in right now?</p>
      </div>

      <div className="space-y-2">
        {PAIN_LEVELS.map((pl) => (
          <button
            key={pl.level}
            onClick={() => onChange(pl.level)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 min-h-[56px] text-left',
              value === pl.level
                ? 'border-current bg-current/10'
                : 'border-border bg-surfaceHigh hover:bg-border',
            )}
            style={value === pl.level ? { color: pl.color, borderColor: pl.color } : {}}
          >
            <span className="text-2xl">{pl.emoji}</span>
            <span className="font-medium text-textPrimary">{pl.label}</span>
            {pl.level >= 8 && (
              <span className="ml-auto text-xs font-bold text-dangerRed bg-dangerRed/10 px-2 py-1 rounded-full">
                Consider ER
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex-2" disabled={value === null}>
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function SymptomsStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[]
  onToggle: (id: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const hasERSymptom = selected.some((s) => ER_SYMPTOMS.includes(s))

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <AnimatedMascot mascot="bella" animation="breathe" size={80} />
        <p className="text-textSecondary">What symptoms are you having?<br/><span className="text-xs">(tap all that apply)</span></p>
      </div>

      {hasERSymptom && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dangerRed/10 border border-dangerRed/30 rounded-xl p-4"
        >
          <p className="text-dangerRed font-semibold text-sm">⚠️ Some of your symptoms may need urgent attention.</p>
          <p className="text-dangerRed/80 text-xs mt-1">Weakness, speech problems, or sudden vision changes can be serious. If unsure, call emergency services.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {SYMPTOMS.map((sym) => {
          const active = selected.includes(sym.id)
          const isER = ER_SYMPTOMS.includes(sym.id)
          return (
            <button
              key={sym.id}
              onClick={() => onToggle(sym.id)}
              className={cn(
                'flex items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-150 text-left min-h-[52px]',
                active
                  ? isER
                    ? 'border-dangerRed bg-dangerRed/10 text-dangerRed'
                    : 'border-accentViolet bg-accentViolet/10 text-accentViolet'
                  : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
              )}
            >
              <span className="text-xl flex-shrink-0">{sym.emoji}</span>
              <span className="text-sm font-medium leading-tight">{sym.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex-2">
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function EnvironmentStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({})

  const steps = [
    { id: 'dark',    emoji: '🌑', label: 'Find a dark room',         detail: 'Dim lights or use blackout curtains' },
    { id: 'quiet',   emoji: '🤫', label: 'Reduce noise',              detail: 'Earplugs, noise-cancelling, or quiet space' },
    { id: 'cool',    emoji: '🧊', label: 'Cool ice pack on neck/head',detail: 'Wrap in cloth, apply to forehead or neck' },
    { id: 'hydrate', emoji: '💧', label: 'Sip cool water slowly',     detail: 'Small sips, even if nauseous' },
    { id: 'lie',     emoji: '🛏️',  label: 'Lie down comfortably',     detail: 'Elevate head slightly if helpful' },
    { id: 'phone',   emoji: '📵', label: 'Limit screen time',         detail: 'Put devices on do-not-disturb' },
  ]

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }))

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <AnimatedMascot mascot="bella" animation="breathe" size={80} />
        <p className="text-textSecondary">Let's set up your environment. Check each one as you do it.</p>
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => toggle(step.id)}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 text-left min-h-[60px]',
              done[step.id]
                ? 'border-safeGreen/50 bg-safeGreen/10'
                : 'border-border bg-surfaceHigh hover:bg-border',
            )}
          >
            <span className="text-2xl flex-shrink-0">{step.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={cn('font-semibold text-sm', done[step.id] ? 'text-safeGreen line-through' : 'text-textPrimary')}>
                {step.label}
              </p>
              <p className="text-xs text-textMuted truncate">{step.detail}</p>
            </div>
            {done[step.id] && <span className="text-safeGreen text-lg">✓</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex-2">
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function TrackProgressStep({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-6">
      <AnimatedMascot mascot="bella" animation="breathe" size={160} />
      <div>
        <h2 className="text-xl font-bold text-textPrimary mb-3">You're doing everything right</h2>
        <p className="text-textSecondary leading-relaxed max-w-sm">
          Rest now. I'll be here when you need me. The attack has been logged.
          Focus on your breathing and resting comfortably.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="card p-4 text-left">
          <p className="text-sm font-semibold text-textPrimary mb-1">Breathing exercise</p>
          <p className="text-xs text-textMuted">Breathe in for 4 counts, hold for 4, out for 6. Repeat slowly.</p>
        </div>
        <div className="card p-4 text-left border-dangerRed/20">
          <p className="text-sm font-semibold text-dangerRed mb-1">🆘 When to seek emergency help</p>
          <p className="text-xs text-textMuted">Sudden severe headache, weakness, speech problems, vision loss, confusion, or stiff neck — call emergency services.</p>
        </div>
      </div>

      <button onClick={onExit} className="btn-secondary w-full max-w-sm">
        I'm feeling better — exit attack mode
      </button>
    </div>
  )
}

export function AttackMode() {
  const [step, setStep] = useState<AttackStep>('welcome')
  const [painLevel, setPainLevel] = useState<number | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [muted, setMuted] = useState(false)
  const setAttackMode = useAppStore((s) => s.setAttackMode)
  const erWarning = useERWarning()

  const handleExit = () => setAttackMode(false)

  const toggleSymptom = (id: string) =>
    setSymptoms((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const stepIndex: Record<AttackStep, number> = {
    welcome: 0, 'pain-level': 1, symptoms: 2, 'pain-side': 2, 'take-meds': 3, environment: 4, 'track-progress': 5,
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Attack mode header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dangerRed/20 bg-dangerRed/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-dangerRed animate-pulse" />
          <span className="text-sm font-semibold text-dangerRed">Attack Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="btn-ghost p-2 min-h-0"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={handleExit}
            className="btn-ghost p-2 min-h-0"
            aria-label="Exit attack mode"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Progress dots */}
      {step !== 'welcome' && step !== 'track-progress' && (
        <div className="flex justify-center gap-2 py-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i <= (stepIndex[step] ?? 0)
                  ? 'bg-accentViolet w-6'
                  : 'bg-border',
              )}
            />
          ))}
        </div>
      )}

      {/* ER warning banner (shown when relevant) */}
      {erWarning.level !== 'none' && (
        <div className="px-4 pt-3">
          <ERWarningBanner warning={erWarning} />
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'welcome' && (
              <WelcomeStep onNext={() => setStep('pain-level')} />
            )}
            {step === 'pain-level' && (
              <PainLevelStep
                value={painLevel}
                onChange={setPainLevel}
                onNext={() => setStep('symptoms')}
                onBack={() => setStep('welcome')}
              />
            )}
            {step === 'symptoms' && (
              <SymptomsStep
                selected={symptoms}
                onToggle={toggleSymptom}
                onNext={() => setStep('environment')}
                onBack={() => setStep('pain-level')}
              />
            )}
            {step === 'environment' && (
              <EnvironmentStep
                onNext={() => setStep('track-progress')}
                onBack={() => setStep('symptoms')}
              />
            )}
            {step === 'track-progress' && (
              <TrackProgressStep onExit={handleExit} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
