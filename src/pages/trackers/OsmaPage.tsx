import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import type { HydrationEntry } from '@/types'

const QUICK_DRINKS = [
  { label: 'Water', ml: 250, emoji: '💧' },
  { label: 'Water', ml: 500, emoji: '💧' },
  { label: 'Tea', ml: 250, emoji: '🍵' },
  { label: 'Coffee', ml: 200, emoji: '☕' },
  { label: 'Juice', ml: 200, emoji: '🧃' },
  { label: 'Sports drink', ml: 500, emoji: '🥤' },
]

const TARGET_ML = 2000

function HydrationRing({ current, target }: { current: number; target: number }) {
  const pct = Math.min(1, current / target)
  const r = 52
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)

  const color = pct >= 0.75 ? '#0d9488' : pct >= 0.5 ? '#3b82f6' : pct >= 0.25 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#1a1a38" strokeWidth="12" />
        <motion.circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold text-textPrimary">{Math.round(current / 100) / 10}L</p>
        <p className="text-[10px] text-textMuted">{Math.round(pct * 100)}%</p>
      </div>
    </div>
  )
}

export function OsmaPage() {
  const navigate = useNavigate()
  const { hydrationEntries, addHydrationEntry } = useAppStore()
  const [customMl, setCustomMl] = useState(250)
  const [logged, setLogged] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntries = hydrationEntries
    .filter((e) => e.loggedAt.startsWith(today))
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())

  const totalMl = todayEntries.reduce((sum, e) => sum + e.amountMl, 0)

  const hydrationStatus =
    totalMl >= TARGET_ML * 0.75 ? { label: 'Well hydrated', color: 'text-safeGreen' }
    : totalMl >= TARGET_ML * 0.5  ? { label: 'Okay', color: 'text-accentIce' }
    : totalMl >= TARGET_ML * 0.25 ? { label: 'Low', color: 'text-warningAmber' }
    : { label: 'Dehydrated', color: 'text-dangerRed' }

  function log(ml: number) {
    const entry: HydrationEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      amountMl: ml,
    }
    addHydrationEntry(entry)
    setLogged(true)
    setTimeout(() => setLogged(false), 1200)
  }

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Osma — Hydration</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Mascot + ring */}
        <div className="flex items-center gap-4">
          <AnimatedMascot mascot="osma" animation="float" size={110} />
          <div className="flex-1 space-y-1">
            <HydrationRing current={totalMl} target={TARGET_ML} />
            <p className={cn('text-center text-sm font-semibold', hydrationStatus.color)}>
              {hydrationStatus.label}
            </p>
            <p className="text-center text-xs text-textMuted">
              {totalMl}ml of {TARGET_ML}ml
            </p>
          </div>
        </div>

        {/* Quick add */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-textSecondary mb-3">Add a drink</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_DRINKS.map((d) => (
              <button
                key={`${d.label}-${d.ml}`}
                onClick={() => log(d.ml)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-border bg-surfaceHigh hover:border-accentIce/40 transition-all min-h-[64px]"
              >
                <span className="text-xl">{d.emoji}</span>
                <span className="text-[10px] text-textMuted">{d.label} {d.ml}ml</span>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <span className="text-sm text-textMuted flex-shrink-0">Custom:</span>
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setCustomMl((v) => Math.max(50, v - 50))}
                className="w-10 h-10 rounded-xl border border-border bg-surfaceHigh flex items-center justify-center text-textSecondary hover:text-textPrimary"
              >
                <Minus size={14} />
              </button>
              <span className="flex-1 text-center font-semibold text-textPrimary">{customMl}ml</span>
              <button
                onClick={() => setCustomMl((v) => v + 50)}
                className="w-10 h-10 rounded-xl border border-border bg-surfaceHigh flex items-center justify-center text-textSecondary hover:text-textPrimary"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => log(customMl)}
              className="px-4 py-2 rounded-xl bg-accentIce/15 border border-accentIce/30 text-accentIce text-sm font-semibold hover:bg-accentIce/25 transition-colors"
            >
              Log
            </button>
          </div>
        </div>

        {logged && (
          <p className="text-center text-sm text-safeGreen font-semibold">💧 Logged!</p>
        )}

        {/* Today's log */}
        {todayEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Today's intake</h3>
            <div className="space-y-1.5">
              {todayEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-textMuted text-xs">{format(parseISO(e.loggedAt), 'h:mm a')}</span>
                  <span className="text-textSecondary">{e.amountMl}ml</span>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-semibold">
                <span className="text-textMuted">Total</span>
                <span className="text-textPrimary">{totalMl}ml</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
