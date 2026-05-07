import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { getCyclePhase } from '@/lib/cyclePhase'
import { cn } from '@/lib/utils'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns'
import type { CycleEntry, FlowLevel } from '@/types'

const FLOW_OPTIONS: { value: FlowLevel; label: string; dot: string }[] = [
  { value: 'spotting', label: 'Spotting', dot: 'bg-pink-300' },
  { value: 'light',    label: 'Light',    dot: 'bg-pink-400' },
  { value: 'medium',   label: 'Medium',   dot: 'bg-pink-500' },
  { value: 'heavy',    label: 'Heavy',    dot: 'bg-pink-600' },
]

const CYCLE_SYMPTOMS = [
  'Cramps', 'Bloating', 'Breast tenderness', 'Back pain',
  'Fatigue', 'Mood swings', 'Acne', 'Nausea',
]

export function HypaPage() {
  const navigate = useNavigate()
  const { cycleEntries, periodStartDate, addCycleEntry, setPeriodStartDate, cyclePhase } = useAppStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntry = cycleEntries.find((e) => e.date === today)
  const [flow, setFlow] = useState<FlowLevel | null>(todayEntry?.flow ?? null)
  const [selected, setSelected] = useState<string[]>(todayEntry?.symptoms ?? [])
  const [saved, setSaved] = useState(false)

  const cycleInfo = getCyclePhase(periodStartDate)

  function toggleSymptom(s: string) {
    setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])
  }

  function handleSave() {
    const entry: CycleEntry = {
      id: crypto.randomUUID(),
      date: today,
      flow: flow ?? undefined,
      symptoms: selected,
    }
    addCycleEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const days = eachDayOfInterval({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
  const entryMap = new Map(cycleEntries.map((e) => [e.date, e]))
  const FLOW_DOT: Record<FlowLevel, string> = { spotting: 'bg-pink-300', light: 'bg-pink-400', medium: 'bg-pink-500', heavy: 'bg-pink-600' }

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
        {/* Mascot + phase */}
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="hypa" cyclePhase={cyclePhase} animation="float" size={110} />
          <div className="card flex-1 p-4 mb-2">
            <p className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-0.5">
              {cyclePhase} phase · Day {cycleInfo.day}
            </p>
            <p className="text-sm text-textSecondary leading-snug">{cycleInfo.subtitle}</p>
          </div>
        </div>

        {/* Period start */}
        <div className="card p-4">
          {periodStartDate ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-textMuted">Period started</p>
                <p className="text-sm font-semibold text-textPrimary">
                  {format(new Date(periodStartDate), 'MMM d, yyyy')}
                </p>
              </div>
              <button
                onClick={() => setPeriodStartDate(new Date())}
                className="text-xs text-pink-400 hover:text-pink-300 transition-colors font-medium"
              >
                Started today
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-textPrimary">Did your period start today?</p>
              <button
                onClick={() => { setPeriodStartDate(new Date()); setFlow('medium') }}
                className="btn-primary text-sm px-4 py-2 min-h-0 h-auto"
                style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.3)' }}
              >
                Yes — mark period start
              </button>
            </div>
          )}
        </div>

        {/* Today's log */}
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Today's log</h3>

          <div>
            <label className="label-base">Flow</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {FLOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFlow(opt.value)}
                  className={cn(
                    'py-3 rounded-xl border text-xs font-semibold transition-all min-h-[48px]',
                    flow === opt.value
                      ? 'border-pink-500/50 bg-pink-500/15 text-pink-400'
                      : 'border-border bg-surfaceHigh text-textMuted',
                  )}
                >
                  <span className={cn('block w-2 h-2 rounded-full mx-auto mb-1', opt.dot)} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">Symptoms</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {CYCLE_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl border text-xs font-medium transition-all min-h-[40px] text-left',
                    selected.includes(s)
                      ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                      : 'border-border bg-surfaceHigh text-textMuted',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className={cn('btn-primary w-full', saved && '!bg-safeGreen')}>
            {saved ? '✓ Saved' : 'Save today'}
          </button>
        </div>

        {/* Calendar */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-textSecondary mb-3">{format(new Date(), 'MMMM yyyy')}</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-textMuted mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={i} />)}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const entry = entryMap.get(key)
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={key}
                  className={cn(
                    'aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium',
                    isToday && 'ring-1 ring-accentViolet',
                    entry?.flow ? `${FLOW_DOT[entry.flow]} text-white` : 'bg-surfaceHigh text-textMuted',
                  )}
                >
                  {format(day, 'd')}
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent */}
        {cycleEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-2">Recent logs</h3>
            <div className="space-y-2">
              {cycleEntries.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-textMuted text-xs">{format(new Date(e.date), 'EEE, MMM d')}</span>
                  <div className="flex items-center gap-2">
                    {e.flow && <span className={cn('w-2 h-2 rounded-full flex-shrink-0', FLOW_DOT[e.flow])} />}
                    <span className="text-textSecondary text-xs capitalize">{e.flow ?? 'No flow'}</span>
                    {e.symptoms.length > 0 && (
                      <span className="text-xs text-textMuted">· {e.symptoms.length} sx</span>
                    )}
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
