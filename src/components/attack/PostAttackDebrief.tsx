import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, Check, Copy } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { generateAttackStory } from '@/services/bellaAI.service'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface DebriefAnswers {
  location: string
  activity: string
  stressors: string
  whatHelped: string[]
  wasDifferent: string
  rememberForNextTime: string
}

const LOCATION_OPTIONS = ['Home', 'Work', 'Out / errands', 'Traveling', 'Other']
const HELPED_OPTIONS = ['Dark room', 'Silence / quiet', 'Ice pack', 'Sleep / rest', 'Hydration', 'Triptan', 'Nausea med', 'Heating pad', 'Other']
const DIFFERENT_OPTIONS = [
  { value: 'no', label: 'No, this felt typical for me' },
  { value: 'somewhat', label: 'Somewhat different' },
  { value: 'yes', label: 'Yes — something felt different' },
  { value: 'unsure', label: "Hard to say" },
]

const TOTAL = 5

export function PostAttackDebrief() {
  const navigate = useNavigate()
  const { activeAttack, addCompletedAttack, setActiveAttack, setAttackMode, cyclePhase, sleepEntries } = useAppStore()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<DebriefAnswers>({
    location: '', activity: '', stressors: '',
    whatHelped: [], wasDifferent: '', rememberForNextTime: '',
  })
  const [story, setStory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!activeAttack) return null

  // Get sleep entry from night before attack
  const attackDate = format(new Date(activeAttack.startedAt), 'yyyy-MM-dd')
  const sleepEntry = sleepEntries.find((s) => s.date === attackDate)

  function go(n: number) {
    setDir(n > step ? 1 : -1)
    setStep(n)
  }

  function toggleHelped(item: string) {
    setAnswers((a) => ({
      ...a,
      whatHelped: a.whatHelped.includes(item)
        ? a.whatHelped.filter((x) => x !== item)
        : [...a.whatHelped, item],
    }))
  }

  async function generateStory() {
    if (!activeAttack) return
    setGenerating(true)
    const text = await generateAttackStory({
      attack: activeAttack,
      cyclePhase,
      sleepHours: sleepEntry ? sleepEntry.durationMinutes / 60 : undefined,
      sleepQuality: sleepEntry?.quality,
      debriefAnswers: {
        location: answers.location,
        activity: answers.activity,
        stressors: answers.stressors,
        whatHelped: answers.whatHelped.join(', '),
        wasDifferent: answers.wasDifferent,
        rememberForNextTime: answers.rememberForNextTime,
      },
    })
    setStory(text)
    setGenerating(false)
  }

  function finish() {
    if (activeAttack) {
      addCompletedAttack({
        ...activeAttack,
        endedAt: activeAttack.endedAt ?? new Date().toISOString(),
        attackStory: story || undefined,
      })
    }
    setActiveAttack(null)
    setAttackMode(false)
    navigate('/')
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
  }

  const steps = [
    // 0 — Where / what
    <div key="where" className="space-y-5">
      <div>
        <label className="label-base">Where were you when it started?</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {LOCATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswers((a) => ({ ...a, location: opt }))}
              className={cn(
                'py-3 px-4 rounded-xl border text-sm font-medium transition-all min-h-[48px]',
                answers.location === opt
                  ? 'border-accentViolet bg-accentViolet/15 text-accentViolet'
                  : 'border-border bg-surfaceHigh text-textSecondary',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-base">What were you doing? (optional)</label>
        <input
          type="text"
          value={answers.activity}
          onChange={(e) => setAnswers((a) => ({ ...a, activity: e.target.value }))}
          placeholder="e.g. working, resting, grocery shopping..."
          className="input-base mt-1"
        />
      </div>
    </div>,

    // 1 — Stressors
    <div key="stress" className="space-y-4">
      <p className="text-sm text-textSecondary">Any unusual stress, big events, or changes in the day or two before it started?</p>
      <textarea
        value={answers.stressors}
        onChange={(e) => setAnswers((a) => ({ ...a, stressors: e.target.value }))}
        placeholder="Optional — whatever feels relevant..."
        rows={4}
        className="input-base resize-none"
      />
    </div>,

    // 2 — What helped
    <div key="helped" className="space-y-3">
      <p className="text-sm text-textSecondary">What helped most? (Select all that apply)</p>
      <div className="grid grid-cols-2 gap-2">
        {HELPED_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => toggleHelped(opt)}
            className={cn(
              'py-3 px-3 rounded-xl border text-sm font-medium transition-all min-h-[48px]',
              answers.whatHelped.includes(opt)
                ? 'border-safeGreen bg-safeGreen/15 text-safeGreen'
                : 'border-border bg-surfaceHigh text-textSecondary',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>,

    // 3 — Different / notes
    <div key="different" className="space-y-5">
      <div>
        <p className="text-sm text-textSecondary mb-2">Did this attack feel different from your usual attacks?</p>
        <div className="space-y-2">
          {DIFFERENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAnswers((a) => ({ ...a, wasDifferent: opt.value }))}
              className={cn(
                'w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all min-h-[48px] text-left',
                answers.wasDifferent === opt.value
                  ? 'border-accentViolet bg-accentViolet/15 text-accentViolet'
                  : 'border-border bg-surfaceHigh text-textSecondary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-base">Anything to remember for next time? (optional)</label>
        <textarea
          value={answers.rememberForNextTime}
          onChange={(e) => setAnswers((a) => ({ ...a, rememberForNextTime: e.target.value }))}
          placeholder="Notes for your future self..."
          rows={3}
          className="input-base resize-none mt-1"
        />
      </div>
    </div>,

    // 4 — Story generation
    <div key="story" className="space-y-4">
      {!story && !generating && (
        <div className="text-center space-y-4">
          <AnimatedMascot mascot="bella" animation="breathe" size={120} />
          <p className="text-sm text-textSecondary">
            Ready to put your attack story together? I'll write a plain-language summary you can use for your records or to share with your doctor.
          </p>
          <button onClick={generateStory} className="btn-primary px-8">
            Generate my story
          </button>
        </div>
      )}
      {generating && (
        <div className="text-center py-8 space-y-3">
          <Loader2 size={32} className="text-accentViolet animate-spin mx-auto" />
          <p className="text-sm text-textMuted">Writing your attack story...</p>
        </div>
      )}
      {story && (
        <div className="space-y-3">
          <div className="card p-4">
            <p className="text-sm text-textPrimary leading-relaxed whitespace-pre-wrap">{story}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { navigator.clipboard.writeText(story); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surfaceHigh text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={generateStory} className="flex-1 py-3 rounded-xl border border-border bg-surfaceHigh text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">
              Try again
            </button>
          </div>
          <button onClick={finish} className="w-full btn-primary min-h-[56px]">
            <Check size={16} className="inline mr-2" />
            Save and finish
          </button>
        </div>
      )}
      {!story && !generating && (
        <button onClick={finish} className="w-full py-3 text-sm text-textMuted underline">
          Skip story — just save
        </button>
      )}
    </div>,
  ]

  const stepTitles = ['Where were you?', 'Any stressors?', 'What helped?', 'How did it feel?', 'Your attack story']
  const canProceed = [true, true, true, true, false]

  return (
    <div className="min-h-full flex flex-col bg-bg">
      <header className="page-header">
        <button
          onClick={() => step > 0 ? go(step - 1) : navigate(-1)}
          className="btn-ghost p-2 -ml-2 min-h-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-textMuted uppercase tracking-wide">Post-attack debrief</p>
          <p className="text-sm font-semibold text-textPrimary">{stepTitles[step]}</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress */}
      <div className="px-4 pb-2">
        <div className="h-1.5 bg-surfaceHigh rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accentViolet to-indigo-400 rounded-full"
            animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 pb-4">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="pt-4"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav — only show for steps 0-3 */}
      {step < TOTAL - 1 && (
        <div className="px-4 pb-6 pt-2 border-t border-border">
          <button
            onClick={() => go(step + 1)}
            disabled={!canProceed[step]}
            className="btn-primary w-full"
          >
            Next <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>
      )}
    </div>
  )
}
