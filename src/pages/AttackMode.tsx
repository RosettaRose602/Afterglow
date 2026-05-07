import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, ChevronRight, RefreshCw } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { SymptomGrid } from '@/components/attack/SymptomGrid'
import { AttackNotes } from '@/components/attack/AttackNotes'
import { PainWaveTracker } from '@/components/attack/PainWaveTracker'
import { AttackTimeline } from '@/components/attack/AttackTimeline'
import { ERWarningBanner } from '@/components/er-warning/ERWarningBanner'
import { useAppStore } from '@/store/appStore'
import { useERWarning } from '@/hooks/useERWarning'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { SelectedSymptom, AttackCheckIn } from '@/types'

type AttackStep = 'welcome' | 'pain-level' | 'symptoms' | 'environment' | 'tracking'

const PAIN_LABELS = ['', 'Barely there', 'Mild', 'Uncomfortable', 'Moderate', 'Significant', 'Intense', 'Very severe', 'Debilitating', 'Excruciating', 'ER level']
const PAIN_EMOJIS = ['', '😐', '😕', '😣', '😖', '😤', '😩', '🤢', '🤯', '😱', '🆘']
const PAIN_COLORS = ['', '#4caf8a','#6ab870','#90b850','#c0a840','#e0943a','#e07030','#d85020','#c83020','#b82020','#e05a5a']

export function AttackMode() {
  const {
    setAttackMode, setActiveAttack, activeAttack,
    updateActiveAttackSymptoms, updateActiveAttackPain,
    addAttackCheckIn, cyclePhase, moonPhaseCache,
  } = useAppStore()
  const erWarning = useERWarning()

  const [step, setStep] = useState<AttackStep>('welcome')
  const [muted, setMuted] = useState(false)
  const [painLevel, setPainLevel] = useState<number | null>(null)
  const [symptoms, setSymptoms] = useState<SelectedSymptom[]>([])
  const [showCheckinOverlay, setShowCheckinOverlay] = useState(false)
  const [checkinPain, setCheckinPain] = useState<number | null>(null)
  const [checkinSymptoms, setCheckinSymptoms] = useState<SelectedSymptom[]>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const moonPhase = moonPhaseCache?.phase ?? 'full-moon'

  function handleStart() {
    if (painLevel === null) return
    const attack = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      phase: 'headache' as const,
      painLevel: painLevel as import('@/types').PainScale,
      painSide: 'left' as const,
      symptoms: symptoms.map((s) => s.id),
      selectedSymptoms: symptoms,
      triggers: [],
      treatments: [],
      erWarning: false,
      waveLog: [{
        id: crypto.randomUUID(),
        attackId: '',
        loggedAt: new Date().toISOString(),
        pain: painLevel,
      }],
      checkIns: [{
        id: crypto.randomUUID(),
        attackId: '',
        loggedAt: new Date().toISOString(),
        symptoms,
        painLevel,
      }],
    }
    // patch attackId into nested entries
    attack.waveLog[0].attackId = attack.id
    attack.checkIns[0].attackId = attack.id
    setActiveAttack(attack)
    setStep('tracking')
  }

  function handlePeriodicCheckIn() {
    if (!activeAttack || checkinPain === null) return
    const checkIn: AttackCheckIn = {
      id: crypto.randomUUID(),
      attackId: activeAttack.id,
      loggedAt: new Date().toISOString(),
      symptoms: checkinSymptoms,
      painLevel: checkinPain,
    }
    addAttackCheckIn(checkIn)
    updateActiveAttackPain(checkinPain)
    updateActiveAttackSymptoms(checkinSymptoms)
    setShowCheckinOverlay(false)
    setCheckinPain(null)
    setCheckinSymptoms([])
  }

  function openCheckinOverlay() {
    setCheckinPain(activeAttack?.painLevel ?? null)
    setCheckinSymptoms(activeAttack?.selectedSymptoms ?? [])
    setShowCheckinOverlay(true)
  }

  function handleExit(goToDebrief = false) {
    if (goToDebrief && activeAttack) {
      // Navigate to debrief — handled by setting endedAt and leaving attack mode
      setActiveAttack({ ...activeAttack, endedAt: new Date().toISOString() })
    }
    setAttackMode(false)
    setActiveAttack(null)
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dangerRed/20 bg-dangerRed/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-dangerRed animate-pulse" />
          <span className="text-sm font-semibold text-dangerRed">Attack Mode</span>
          {activeAttack && (
            <span className="text-xs text-textMuted ml-1">
              · {formatDistanceToNow(parseISO(activeAttack.startedAt))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMuted(!muted)} className="btn-ghost p-2 min-h-0">
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          {step === 'tracking' ? (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="btn-ghost p-2 min-h-0 text-textMuted hover:text-dangerRed text-xs font-semibold"
            >
              End
            </button>
          ) : (
            <button onClick={() => handleExit()} className="btn-ghost p-2 min-h-0">
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* ER warning */}
      {erWarning.level !== 'none' && (
        <div className="px-4 pt-3 flex-shrink-0">
          <ERWarningBanner warning={erWarning} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
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
                symptoms={symptoms}
                onChange={setSymptoms}
                onNext={() => {
                  updateActiveAttackSymptoms(symptoms)
                  handleStart()
                }}
                onBack={() => setStep('pain-level')}
              />
            )}
            {step === 'tracking' && activeAttack && (
              <TrackingDashboard
                attackId={activeAttack.id}
                onCheckin={openCheckinOverlay}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Periodic check-in overlay */}
      <AnimatePresence>
        {showCheckinOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-bold text-textPrimary">How are you right now?</h2>
              <button onClick={() => setShowCheckinOverlay(false)} className="btn-ghost p-2 min-h-0">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Pain picker */}
              <div>
                <p className="text-sm font-semibold text-textSecondary mb-2">Pain level</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setCheckinPain(n)}
                      className={cn(
                        'py-3 rounded-xl border text-sm font-bold transition-all min-h-[48px]',
                        checkinPain === n
                          ? 'border-transparent text-white'
                          : 'border-border bg-surfaceHigh text-textSecondary',
                      )}
                      style={checkinPain === n ? { backgroundColor: PAIN_COLORS[n] } : undefined}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {/* Symptom update */}
              <div>
                <p className="text-sm font-semibold text-textSecondary mb-2">Update symptoms</p>
                <SymptomGrid
                  selected={checkinSymptoms}
                  onChange={setCheckinSymptoms}
                  pinned={activeAttack?.selectedSymptoms.map((s) => s.id)}
                />
              </div>
            </div>
            <div className="px-4 pb-6 pt-3 border-t border-border">
              <button
                onClick={handlePeriodicCheckIn}
                disabled={checkinPain === null}
                className={cn('btn-primary w-full', checkinPain === null && 'opacity-40 cursor-not-allowed')}
              >
                Save check-in
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End-attack confirm */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end"
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="w-full bg-surface rounded-t-2xl p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-textPrimary">End attack?</h2>
              <p className="text-sm text-textMuted">
                Mark this migraine as over and record the end time.
              </p>
              <button
                onClick={() => { setShowEndConfirm(false); handleExit(true) }}
                className="w-full py-4 rounded-xl bg-safeGreen/15 border border-safeGreen/30 text-safeGreen font-semibold text-sm min-h-[56px]"
              >
                Yes, I'm feeling better — end attack
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full py-4 rounded-xl bg-surfaceHigh border border-border text-textSecondary font-semibold text-sm min-h-[56px]"
              >
                Not yet — keep tracking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step: Welcome ────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-6">
      <AnimatedMascot mascot="bella" animation="breathe" size={180} />
      <div>
        <h2 className="text-2xl font-bold text-textPrimary mb-3">I'm here with you</h2>
        <p className="text-textSecondary leading-relaxed max-w-sm">
          Let's get you set up so I can track everything and help you through this.
          Take a breath — you don't have to figure this out alone.
        </p>
      </div>
      <button onClick={onNext} className="btn-primary px-10 min-h-[56px] text-base">
        Start tracking <ChevronRight size={18} className="inline ml-1" />
      </button>
    </div>
  )
}

// ─── Step: Pain level ─────────────────────────────────────────────────────────

function PainLevelStep({
  value, onChange, onNext, onBack,
}: {
  value: number | null
  onChange: (v: number) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost p-2 min-h-0 -ml-2">
          ←
        </button>
        <h2 className="text-lg font-bold text-textPrimary">How bad is the pain?</h2>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all min-h-[56px] text-left',
              value === n
                ? 'border-transparent text-white'
                : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
            )}
            style={value === n ? { backgroundColor: PAIN_COLORS[n] + 'cc', borderColor: PAIN_COLORS[n] } : undefined}
          >
            <span className="text-2xl w-8 text-center">{PAIN_EMOJIS[n]}</span>
            <div>
              <span className="font-bold text-base">{n}</span>
              <span className="text-sm ml-2 opacity-80">{PAIN_LABELS[n]}</span>
            </div>
            {n >= 8 && (
              <span className="ml-auto text-xs font-semibold opacity-75">ER level</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={value === null}
        className={cn('btn-primary w-full min-h-[56px]', value === null && 'opacity-40 cursor-not-allowed')}
      >
        Next — log symptoms
      </button>
    </div>
  )
}

// ─── Step: Symptoms ───────────────────────────────────────────────────────────

function SymptomsStep({
  symptoms, onChange, onNext, onBack,
}: {
  symptoms: SelectedSymptom[]
  onChange: (s: SelectedSymptom[]) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn-ghost p-2 min-h-0 -ml-2">←</button>
        <div>
          <h2 className="text-lg font-bold text-textPrimary">What are you feeling?</h2>
          <p className="text-xs text-textMuted">Tap everything that applies — no need to categorize</p>
        </div>
      </div>

      <SymptomGrid selected={symptoms} onChange={onChange} />

      <button onClick={onNext} className="btn-primary w-full min-h-[56px] sticky bottom-4">
        {symptoms.length === 0 ? 'Skip — start tracking' : `Continue with ${symptoms.length} symptom${symptoms.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  )
}

// ─── Tracking dashboard ───────────────────────────────────────────────────────

function TrackingDashboard({ attackId, onCheckin }: { attackId: string; onCheckin: () => void }) {
  const { activeAttack } = useAppStore()
  if (!activeAttack) return null

  const currentPain = activeAttack.painLevel
  const symptomCount = activeAttack.selectedSymptoms.length

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Bella + status */}
      <div className="flex items-end gap-4">
        <AnimatedMascot mascot="bella" animation="breathe" size={110} />
        <div className="card flex-1 p-4 mb-2">
          <p className="text-sm text-textPrimary leading-relaxed">
            {currentPain >= 8
              ? "This is really bad. You're not alone — I'm tracking everything. Rest and breathe."
              : currentPain >= 5
              ? "I've got you. Try to rest in a dark, quiet space. I'll keep watch."
              : "I'm here. Take it easy — rest, dark room, hydrate when you can."}
          </p>
        </div>
      </div>

      {/* Current status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: PAIN_COLORS[currentPain] }}>
            {currentPain}
          </p>
          <p className="text-xs text-textMuted mt-0.5">Pain level</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-textPrimary">{symptomCount}</p>
          <p className="text-xs text-textMuted mt-0.5">Symptoms logged</p>
        </div>
      </div>

      {/* Check-in button */}
      <button
        onClick={onCheckin}
        className="w-full card p-4 border-accentViolet/20 hover:border-accentViolet/40 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-accentViolet/15 flex items-center justify-center flex-shrink-0">
          <RefreshCw size={18} className="text-accentViolet" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-textPrimary">Update symptoms & pain</p>
          <p className="text-xs text-textMuted">Log how you're feeling now</p>
        </div>
        <ChevronRight size={16} className="text-textMuted ml-auto flex-shrink-0" />
      </button>

      {/* Pain wave */}
      <PainWaveTracker attackId={attackId} />

      {/* Timeline (appears after 2+ check-ins) */}
      <AttackTimeline />

      {/* Notes */}
      <AttackNotes />
    </div>
  )
}
