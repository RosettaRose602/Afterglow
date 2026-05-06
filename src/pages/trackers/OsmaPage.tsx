import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Minus } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { HydrationEntry } from '@/types'

const QUICK_AMOUNTS = [150, 250, 350, 500]

function HydrationRing({ current, target }: { current: number; target: number }) {
  const pct = Math.min(1, current / target)
  const size = 120
  const r = 50
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a2e" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={pct >= 1 ? '#4caf8a' : pct >= 0.6 ? '#6ab4d4' : '#e0943a'}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <text x="60" y="56" textAnchor="middle" fill="#e8e0f0" fontSize="16" fontWeight="700">
          {Math.round(current / 1000 * 10) / 10}L
        </text>
        <text x="60" y="72" textAnchor="middle" fill="#505070" fontSize="10">
          / {target / 1000}L
        </text>
      </svg>
      <p className="text-xs text-textMuted">{Math.round(pct * 100)}% of daily goal</p>
    </div>
  )
}

export function OsmaPage() {
  const navigate = useNavigate()
  const { hydrationEntries, addHydrationEntry, user } = useAppStore()
  const [customAmount, setCustomAmount] = useState(250)
  const [saved, setSaved] = useState(false)

  const target = user?.preferences.hydrationTarget ?? 2000
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEntries = hydrationEntries.filter((e) => e.loggedAt.startsWith(today))
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.amountMl, 0)

  const logAmount = (ml: number) => {
    const entry: HydrationEntry = {
      id: crypto.randomUUID(),
      loggedAt: new Date().toISOString(),
      amountMl: ml,
    }
    addHydrationEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
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
        <div className="card p-5 flex items-center justify-around">
          <AnimatedMascot mascot="osma" size={120} animation="bounce" />
          <HydrationRing current={todayTotal} target={target} />
        </div>

        <div className="card p-4">
          <p className="text-sm text-textSecondary leading-relaxed">
            {todayTotal < target * 0.5
              ? "You haven't had much water yet today! Dehydration is a big migraine trigger. 💧"
              : todayTotal < target
              ? "You're on the right track! Keep going — almost there. 💙"
              : "Excellent! You've hit your hydration goal today! 🌊"}
          </p>
        </div>

        {/* Quick log */}
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Quick log</h3>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((ml) => (
              <button
                key={ml}
                onClick={() => logAmount(ml)}
                className="flex flex-col items-center p-3 rounded-xl border border-sky-800/30 bg-sky-900/20 hover:bg-sky-900/40 transition-all min-h-[60px] text-center"
              >
                <span className="text-lg">💧</span>
                <span className="text-xs font-semibold text-sky-400">{ml}ml</span>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div>
            <label className="label-base">Custom amount</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustomAmount((v) => Math.max(50, v - 50))}
                className="btn-ghost p-2 min-h-0 w-10 h-10"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 input-base text-center font-semibold">{customAmount} ml</div>
              <button
                onClick={() => setCustomAmount((v) => v + 50)}
                className="btn-ghost p-2 min-h-0 w-10 h-10"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => logAmount(customAmount)}
              className={cn('btn-primary w-full mt-2', saved && 'bg-safeGreen')}
            >
              {saved ? '✓ Logged!' : `+ Log ${customAmount}ml`}
            </button>
          </div>
        </div>

        {/* Today's log */}
        {todayEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Today's log ({todayTotal}ml total)</h3>
            <div className="space-y-2">
              {todayEntries.slice().reverse().map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-textMuted">{format(new Date(e.loggedAt), 'h:mm a')}</span>
                  <span className="text-sky-400 font-medium">💧 {e.amountMl}ml</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
