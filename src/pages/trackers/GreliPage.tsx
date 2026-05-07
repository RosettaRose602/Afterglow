import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { format, differenceInHours, parseISO } from 'date-fns'
import type { NourishmentEntry } from '@/types'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const QUICK_FOODS = ['Meal', 'Snack', 'Coffee', 'Smoothie', 'Supplements']

export function GreliPage() {
  const navigate = useNavigate()
  const { nourishmentEntries, addNourishmentEntry } = useAppStore()

  const [mealType, setMealType] = useState<string>('Meal')
  const [foodName, setFoodName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntries = nourishmentEntries
    .filter((e) => e.loggedAt.startsWith(today))
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())

  // Meal gap calculation
  const lastMeal = [...nourishmentEntries].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )[0]
  const hoursSinceMeal = lastMeal ? differenceInHours(new Date(), parseISO(lastMeal.loggedAt)) : null

  function handleQuickLog(label: string) {
    const entry: NourishmentEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      hunger: 3,
      ate: true,
      meal: label,
    }
    addNourishmentEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleFullLog() {
    if (!foodName.trim()) return
    const entry: NourishmentEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      hunger: 3,
      ate: true,
      meal: `${mealType}: ${foodName}`,
    }
    addNourishmentEntry(entry)
    setFoodName('')
    setShowForm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const mealGapWarning =
    hoursSinceMeal !== null && hoursSinceMeal > 5
      ? hoursSinceMeal > 7
        ? 'danger'
        : 'warning'
      : null

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
        {/* Mascot + status */}
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="greli" animation="float" size={110} />
          <div className="card flex-1 p-4 mb-2">
            {mealGapWarning ? (
              <>
                <p className={cn('text-xs font-semibold uppercase tracking-wide mb-0.5',
                  mealGapWarning === 'danger' ? 'text-dangerRed' : 'text-warningAmber',
                )}>
                  {mealGapWarning === 'danger' ? '⚠️ Long gap' : '💡 Getting hungry?'}
                </p>
                <p className="text-sm text-textSecondary">
                  {hoursSinceMeal}h since your last meal. Low blood sugar can spike your threshold.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-safeGreen uppercase tracking-wide mb-0.5">Nourished</p>
                <p className="text-sm text-textSecondary">
                  {todayEntries.length > 0
                    ? `${todayEntries.length} meal${todayEntries.length !== 1 ? 's' : ''} logged today`
                    : "Log your first meal of the day"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Meal gap warning card */}
        {mealGapWarning === 'danger' && (
          <div className="card p-4 border-dangerRed/20 bg-dangerRed/5">
            <p className="text-sm font-semibold text-dangerRed mb-1">Eat something soon</p>
            <p className="text-xs text-textSecondary">
              It's been {hoursSinceMeal}h since your last meal. Skipping meals for this long adds up to 10 points on your threshold.
            </p>
          </div>
        )}

        {/* Quick log */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-textSecondary mb-3">Quick log</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_FOODS.map((label) => (
              <button
                key={label}
                onClick={() => handleQuickLog(label)}
                className="py-3 rounded-xl border border-border bg-surfaceHigh text-xs font-medium text-textSecondary hover:text-textPrimary hover:border-accentGreen/40 transition-all min-h-[44px]"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-sm text-textMuted hover:text-textPrimary transition-colors"
          >
            <Plus size={14} />
            Add with details
          </button>

          {/* Detailed form */}
          {showForm && (
            <div className="mt-3 space-y-3 pt-3 border-t border-border">
              <div className="grid grid-cols-4 gap-1.5">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setMealType(t)}
                    className={cn(
                      'py-2 rounded-lg border text-xs font-medium transition-all',
                      mealType === t
                        ? 'border-accentGreen/50 bg-accentGreen/10 text-accentGreen'
                        : 'border-border bg-surfaceHigh text-textMuted',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="What did you eat?"
                className="input-base"
                onKeyDown={(e) => e.key === 'Enter' && handleFullLog()}
              />
              <button
                onClick={handleFullLog}
                disabled={!foodName.trim()}
                className={cn('btn-primary w-full', !foodName.trim() && 'opacity-40 cursor-not-allowed')}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Saved indicator */}
        {saved && (
          <p className="text-center text-sm text-safeGreen font-semibold">✓ Logged!</p>
        )}

        {/* Today's timeline */}
        {todayEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Today's meals</h3>
            <div className="space-y-2">
              {todayEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1">
                  <span className="text-textMuted text-xs">
                    {format(parseISO(e.loggedAt), 'h:mm a')}
                  </span>
                  <span className="text-textSecondary">{e.meal ?? 'Meal logged'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
