import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { NourishmentEntry, HungerLevel } from '@/types'

const HUNGER_LEVELS: { value: HungerLevel; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: '🫠', label: 'Empty',    color: 'text-dangerRed' },
  { value: 2, emoji: '😮‍💨', label: 'Low',      color: 'text-warningAmber' },
  { value: 3, emoji: '😐', label: 'Neutral',  color: 'text-textSecondary' },
  { value: 4, emoji: '😊', label: 'Satisfied',color: 'text-accentGreen' },
  { value: 5, emoji: '😄', label: 'Full',     color: 'text-safeGreen' },
]

export function GreliPage() {
  const navigate = useNavigate()
  const { nourishmentEntries, addNourishmentEntry } = useAppStore()
  const [hunger, setHunger] = useState<HungerLevel | null>(null)
  const [ate, setAte] = useState<boolean | null>(null)
  const [meal, setMeal] = useState('')
  const [saved, setSaved] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntries = nourishmentEntries.filter((e) => e.loggedAt.startsWith(today))

  const handleSave = () => {
    if (hunger === null || ate === null) return
    const entry: NourishmentEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      hunger,
      ate,
      meal: meal || undefined,
    }
    addNourishmentEntry(entry)
    setHunger(null)
    setAte(null)
    setMeal('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Greli — Nourishment</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="greli" size={120} animation="bounce" />
          <div className="card flex-1 p-4 mb-2">
            <p className="text-sm text-textSecondary leading-relaxed">
              Skipping meals can lower your migraine threshold. I'm here to help you track — no judgment, just care! 🌱
            </p>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Log a meal check-in</h3>

          <div>
            <label className="label-base">How hungry are you right now?</label>
            <div className="grid grid-cols-5 gap-2">
              {HUNGER_LEVELS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHunger(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all min-h-[60px]',
                    hunger === opt.value
                      ? 'border-emerald-500 bg-emerald-500/15'
                      : 'border-border bg-surfaceHigh text-textMuted hover:text-textPrimary',
                  )}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={cn('text-[10px]', hunger === opt.value ? 'text-emerald-400' : opt.color)}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-base">Did you eat recently?</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: true, label: 'Yes, I ate 🍽️' }, { v: false, label: 'Not yet 😔' }].map(({ v, label }) => (
                <button
                  key={String(v)}
                  onClick={() => setAte(v)}
                  className={cn(
                    'p-3 rounded-xl border font-medium text-sm transition-all min-h-[44px]',
                    ate === v
                      ? v ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' : 'border-warningAmber/50 bg-warningAmber/10 text-warningAmber'
                      : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {ate && (
            <div>
              <label className="label-base">What did you eat? (optional)</label>
              <input
                type="text"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                placeholder="e.g. soup, sandwich, fruit..."
                className="input-base"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={hunger === null || ate === null}
            className={cn('btn-primary w-full', saved && 'bg-safeGreen')}
          >
            {saved ? '✓ Logged' : <><Plus size={16} /> Log check-in</>}
          </button>
        </div>

        {todayEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Today's logs</h3>
            <div className="space-y-2">
              {todayEntries.map((e) => {
                const hl = HUNGER_LEVELS.find((h) => h.value === e.hunger)
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-textMuted">{format(new Date(e.loggedAt), 'h:mm a')}</span>
                    <span className="text-textSecondary">{hl?.emoji} {hl?.label}</span>
                    <span className={cn('text-xs font-semibold', e.ate ? 'text-safeGreen' : 'text-warningAmber')}>
                      {e.ate ? 'Ate' : 'Skipped'}
                    </span>
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
