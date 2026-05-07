import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Zap } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

// ─── Triage questions ─────────────────────────────────────────────────────────

interface Question {
  id: string
  text: string
  options: { label: string; value: string; weight: number }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'location',
    text: 'Where do you feel it?',
    options: [
      { label: 'Head', value: 'head', weight: 3 },
      { label: 'Neck', value: 'neck', weight: 2 },
      { label: 'Eyes', value: 'eyes', weight: 2 },
      { label: 'Stomach', value: 'stomach', weight: 1 },
      { label: 'Nowhere yet', value: 'none', weight: 0 },
    ],
  },
  {
    id: 'vision',
    text: 'Any visual weirdness?',
    options: [
      { label: 'Zigzags / scintillating', value: 'zigzag', weight: 5 },
      { label: 'Blind spot', value: 'blindspot', weight: 5 },
      { label: 'Blurry', value: 'blurry', weight: 3 },
      { label: 'Flashing lights', value: 'flashing', weight: 4 },
      { label: 'Nothing', value: 'none', weight: 0 },
    ],
  },
  {
    id: 'neuro',
    text: 'Numbness or tingling anywhere?',
    options: [
      { label: 'Left side', value: 'left', weight: 4 },
      { label: 'Right side', value: 'right', weight: 4 },
      { label: 'Hands / fingers', value: 'hands', weight: 3 },
      { label: 'Face', value: 'face', weight: 4 },
      { label: 'None', value: 'none', weight: 0 },
    ],
  },
  {
    id: 'energy',
    text: "How's your energy?",
    options: [
      { label: 'Fine', value: 'fine', weight: 0 },
      { label: 'Tired', value: 'tired', weight: 1 },
      { label: 'Exhausted', value: 'exhausted', weight: 2 },
      { label: 'Wired / strange', value: 'wired', weight: 3 },
    ],
  },
  {
    id: 'nausea',
    text: 'Nausea?',
    options: [
      { label: 'Yes', value: 'yes', weight: 3 },
      { label: 'A little', value: 'little', weight: 1 },
      { label: 'No', value: 'no', weight: 0 },
    ],
  },
  {
    id: 'sensitivity',
    text: 'Light or sound bothering you more than usual?',
    options: [
      { label: 'Yes — a lot', value: 'yes', weight: 3 },
      { label: 'A little', value: 'little', weight: 1 },
      { label: 'Not really', value: 'no', weight: 0 },
    ],
  },
]

type Assessment = 'prodrome' | 'aura' | 'unsure'

function assess(answers: Record<string, string>): Assessment {
  const totalWeight = Object.entries(answers).reduce((sum, [qId, val]) => {
    const q = QUESTIONS.find((q) => q.id === qId)
    const opt = q?.options.find((o) => o.value === val)
    return sum + (opt?.weight ?? 0)
  }, 0)

  const hasAura =
    ['zigzag', 'blindspot', 'flashing'].includes(answers.vision ?? '') ||
    ['left', 'right', 'face'].includes(answers.neuro ?? '')

  if (hasAura) return 'aura'
  if (totalWeight >= 8) return 'prodrome'
  return 'unsure'
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onStartAttack: () => void
}

export function AmIStartingFlow({ onStartAttack }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Assessment | null>(null)
  const { threshold } = useAppStore()

  function answer(qId: string, val: string) {
    const updated = { ...answers, [qId]: val }
    setAnswers(updated)
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1)
    } else {
      setResult(assess(updated))
    }
  }

  function reset() {
    setStep(0)
    setAnswers({})
    setResult(null)
  }

  function close() {
    setOpen(false)
    reset()
  }

  const ASSESSMENT_CONTENT: Record<Assessment, { title: string; body: string; cta?: string; ctaAction?: () => void; urgent: boolean }> = {
    aura: {
      title: 'This looks like aura',
      body: "Aura symptoms are happening — a migraine may be 20–60 minutes away, possibly sooner. If you have an abortive medication (triptan, Ubrelvy, etc.), now is the best time to take it. Early is better.",
      cta: 'Start attack tracker',
      ctaAction: () => { close(); onStartAttack() },
      urgent: true,
    },
    prodrome: {
      title: 'Looks like prodrome',
      body: "Your body is showing pre-migraine signals. If your protocol includes taking an abortive early, consider it now. Rest, hydrate, lower stimulation, and keep this app open so we can track what happens next.",
      cta: 'Start attack tracker',
      ctaAction: () => { close(); onStartAttack() },
      urgent: false,
    },
    unsure: {
      title: "Hard to say right now",
      body: "Your symptoms don't clearly point to one pattern yet. Pay attention over the next 30–60 minutes. If anything gets worse or new symptoms appear, come back and update. I'll keep watching.",
      urgent: false,
    },
  }

  return (
    <>
      {/* Trigger button — always on dashboard */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surfaceHigh hover:bg-surface transition-colors text-left"
      >
        <span className="text-lg">🤔</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-textSecondary">Something feels off</p>
          <p className="text-xs text-textMuted">Not sure if it's starting? Let's find out.</p>
        </div>
        <ChevronRight size={14} className="text-textMuted flex-shrink-0" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AnimatedMascot mascot="cere" animation="float" intensity="pulsing" size={32} />
                <span className="text-sm font-semibold text-textPrimary">Am I starting?</span>
              </div>
              <button onClick={close} className="btn-ghost p-2 min-h-0">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <AnimatePresence mode="wait">
                {result ? (
                  // Result card
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm space-y-5"
                  >
                    <AnimatedMascot
                      mascot="cere"
                      animation={result === 'aura' ? 'pulse' : 'float'}
                      intensity={result === 'aura' ? 'alert' : 'pulsing'}
                      size={110}
                    />
                    <div className={cn(
                      'card p-5',
                      result === 'aura' && 'border-warningAmber/30 bg-warningAmber/5',
                      result === 'prodrome' && 'border-accentViolet/30',
                    )}>
                      <h3 className={cn(
                        'text-base font-bold mb-2',
                        result === 'aura' ? 'text-warningAmber' : 'text-textPrimary',
                      )}>
                        {ASSESSMENT_CONTENT[result].title}
                      </h3>
                      <p className="text-sm text-textSecondary leading-relaxed">
                        {ASSESSMENT_CONTENT[result].body}
                      </p>
                    </div>

                    {ASSESSMENT_CONTENT[result].cta && (
                      <button
                        onClick={ASSESSMENT_CONTENT[result].ctaAction}
                        className={cn(
                          'w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[56px]',
                          result === 'aura'
                            ? 'bg-warningAmber/15 border border-warningAmber/30 text-warningAmber'
                            : 'btn-primary',
                        )}
                      >
                        <Zap size={16} />
                        {ASSESSMENT_CONTENT[result].cta}
                      </button>
                    )}
                    <button onClick={reset} className="w-full text-sm text-textMuted underline py-2">
                      Answer again
                    </button>
                  </motion.div>
                ) : (
                  // Question card
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.18 }}
                    className="w-full max-w-sm space-y-5"
                  >
                    <div className="text-center space-y-1">
                      <p className="text-xs text-textMuted">{step + 1} of {QUESTIONS.length}</p>
                      <h3 className="text-lg font-bold text-textPrimary">
                        {QUESTIONS[step].text}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {QUESTIONS[step].options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => answer(QUESTIONS[step].id, opt.value)}
                          className="w-full py-4 px-5 rounded-xl border border-border bg-surfaceHigh text-sm font-medium text-textSecondary hover:text-textPrimary hover:border-accentViolet/40 transition-all min-h-[56px] text-left"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
