import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { getCyclePhase } from '@/lib/cyclePhase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { FlowLevel, CycleEntry } from '@/types'

const FLOW_OPTIONS: { value: FlowLevel; emoji: string; label: string }[] = [
  { value: 'spotting', emoji: '🩸', label: 'Spotting' },
  { value: 'light',    emoji: '🩸', label: 'Light' },
  { value: 'medium',   emoji: '🩸', label: 'Medium' },
  { value: 'heavy',    emoji: '🩸', label: 'Heavy' },
]

const PERIOD_SYMPTOMS = [
  { id: 'cramps',     emoji: '😣', label: 'Cramps' },
  { id: 'bloating',   emoji: '🫃', label: 'Bloating' },
  { id: 'fatigue',    emoji: '😴', label: 'Fatigue' },
  { id: 'mood',       emoji: '😢', label: 'Mood swings' },
  { id: 'back-pain',  emoji: '🔙', label: 'Back pain' },
  { id: 'breast',     emoji: '🩹', label: 'Breast tenderness' },
  { id: 'nausea',     emoji: '🤢', label: 'Nausea' },
  { id: 'headache',   emoji: '🤕', label: 'Headache' },
]

const PHASE_LABELS = {
  menstrual:  { emoji: '🌑', subtitle: 'Rest & Reset',     tip: 'Be gentle with yourself. Rest and warmth help.' },
  follicular: { emoji: '🌱', subtitle: 'Renew & Grow',     tip: 'Energy is building. Good time for gentle movement.' },
  ovulation:  { emoji: '✨', subtitle: 'Peak & Radiate',   tip: 'You\'re at your most energetic. Celebrate it.' },
  luteal:     { emoji: '🍂', subtitle: 'Nourish & Reflect',tip: 'Wind down gently. Nourish and rest well.' },
}

export function HypaPage() {
  const navigate = useNavigate()
  const { cyclePhase, periodStartDate, setPeriodStartDate, addCycleEntry, cycleEntries } = useAppStore()
  const [flow, setFlow] = useState<FlowLevel | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const cycleInfo = getCyclePhase(periodStartDate)
  const phaseInfo = PHASE_LABELS[cyclePhase]
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntry = cycleEntries.find((e) => e.date === today)

  const toggleSymptom = (id: string) =>
    setSymptoms((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const handleSave = () => {
    const entry: CycleEntry = {
      id: crypto.randomUUID(),
      date: today,
      flow: flow ?? undefined,
      symptoms,
    }
    addCycleEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePeriodStart = () => {
    setPeriodStartDate(new Date())
  }

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Hypa — Cycle</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Mascot + phase info */}
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="hypa" cyclePhase={cyclePhase} size={120} animation="float" />
          <div className="card flex-1 p-4 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span>{phaseInfo.emoji}</span>
              <span className="font-bold text-textPrimary capitalize">{cyclePhase}</span>
            </div>
            <p className="text-xs text-rose-400 font-semibold mb-1">{phaseInfo.subtitle}</p>
            <p className="text-xs text-textMuted">{phaseInfo.tip}</p>
            {cycleInfo.day > 0 && (
              <p className="text-xs text-textSecondary mt-2">Cycle day <strong>{cycleInfo.day}</strong></p>
            )}
          </div>
        </div>

        {/* Period start button */}
        <div className="card p-4">
          <p className="text-sm font-semibold text-textPrimary mb-3">Period tracking</p>
          {periodStartDate ? (
            <div className="text-sm text-textSecondary">
              Last period started: <strong className="text-textPrimary">{format(periodStartDate, 'MMM d')}</strong>
              <button
                onClick={() => setPeriodStartDate(null)}
                className="ml-3 text-xs text-textMuted hover:text-textPrimary underline"
              >
                Reset
              </button>
            </div>
          ) : (
            <button onClick={handlePeriodStart} className="btn-primary w-full">
              <Plus size={16} /> Period started today
            </button>
          )}
        </div>

        {/* Today's log */}
        {!todayEntry && (
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-textPrimary">Log today</h3>

            {/* Flow */}
            <div>
              <label className="label-base">Flow</label>
              <div className="grid grid-cols-4 gap-2">
                {FLOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFlow(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all min-h-[52px]',
                      flow === opt.value
                        ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                        : 'border-border bg-surfaceHigh text-textMuted hover:text-textPrimary',
                    )}
                  >
                    <span style={{ fontSize: flow === opt.value ? '18px' : '14px' }}>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="label-base">Symptoms</label>
              <div className="grid grid-cols-2 gap-2">
                {PERIOD_SYMPTOMS.map((sym) => (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-sm transition-all min-h-[44px]',
                      symptoms.includes(sym.id)
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                        : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
                    )}
                  >
                    <span>{sym.emoji}</span>
                    {sym.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className={cn('btn-primary w-full', saved && 'bg-safeGreen')}
            >
              {saved ? '✓ Saved' : 'Save today\'s log'}
            </button>
          </div>
        )}

        {todayEntry && (
          <div className="card p-4 border-safeGreen/20">
            <p className="text-sm font-semibold text-safeGreen">✓ Logged today</p>
            {todayEntry.flow && <p className="text-xs text-textMuted mt-1">Flow: {todayEntry.flow}</p>}
            {todayEntry.symptoms.length > 0 && (
              <p className="text-xs text-textMuted">Symptoms: {todayEntry.symptoms.join(', ')}</p>
            )}
          </div>
        )}

        {/* Recent entries */}
        {cycleEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Recent entries</h3>
            <div className="space-y-2">
              {cycleEntries.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-textMuted">{format(new Date(e.date), 'MMM d')}</span>
                  <span className="text-textSecondary capitalize">{e.flow ?? 'No flow'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
