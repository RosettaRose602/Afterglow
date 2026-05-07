import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, ChevronRight, ClipboardCheck } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { AmIStartingFlow } from '@/components/dashboard/AmIStartingFlow'
import { useAppStore } from '@/store/appStore'
import { getMoonPhase } from '@/lib/moonPhase'
import { getCyclePhase } from '@/lib/cyclePhase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

function ThresholdMeter({ score, zone }: { score: number; zone: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wide">Migraine Threshold</h2>
        <span
          className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            zone === 'safe' && 'bg-safeGreen/15 text-safeGreen',
            zone === 'warning' && 'bg-warningAmber/15 text-warningAmber',
            zone === 'danger' && 'bg-dangerRed/15 text-dangerRed',
          )}
        >
          {zone === 'safe' ? 'Protected' : zone === 'warning' ? 'Watch out' : 'High risk'}
        </span>
      </div>

      {/* Meter bar */}
      <div className="relative h-4 bg-surfaceHigh rounded-full overflow-hidden mb-2">
        <motion.div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full',
            zone === 'safe' && 'bg-gradient-to-r from-safeGreen to-emerald-400',
            zone === 'warning' && 'bg-gradient-to-r from-warningAmber to-amber-400',
            zone === 'danger' && 'bg-gradient-to-r from-dangerRed to-rose-400',
          )}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Zone markers */}
        <div className="absolute left-[35%] top-0 h-full w-px bg-border opacity-60" />
        <div className="absolute left-[65%] top-0 h-full w-px bg-border opacity-60" />
      </div>

      <div className="flex justify-between text-[10px] text-textMuted">
        <span>Danger</span>
        <span>Warning</span>
        <span>Safe</span>
      </div>

      <p className="text-3xl font-bold text-textPrimary mt-3">
        {score}<span className="text-lg text-textMuted font-normal">%</span>
      </p>
      <p className="text-xs text-textMuted mt-0.5">
        {zone === 'safe'
          ? 'Your threshold is well-protected today.'
          : zone === 'warning'
          ? 'Your threshold is getting lower — take care of yourself.'
          : 'High migraine risk — consider resting and reviewing triggers.'}
      </p>
    </div>
  )
}

function QuickLogCard({ onCheckIn }: { onCheckIn: () => void }) {
  const navigate = useNavigate()
  const items = [
    { label: 'Check-in', icon: '💜', color: 'border-accentViolet/30 hover:border-accentViolet/60', onClick: onCheckIn },
    { label: 'Water', icon: '💧', color: 'border-accentIce/30 hover:border-accentIce/60', onClick: () => navigate('/trackers/osma') },
    { label: 'Meal', icon: '🌿', color: 'border-accentGreen/30 hover:border-accentGreen/60', onClick: () => navigate('/trackers/greli') },
    { label: 'Exercise', icon: '⚡', color: 'border-accentGold/30 hover:border-accentGold/60', onClick: () => navigate('/trackers/dophi') },
  ]
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-textSecondary mb-3">Quick Log</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ label, icon, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl border bg-surfaceHigh transition-all duration-150 text-sm font-medium text-textSecondary hover:text-textPrimary min-h-[44px]',
              color,
            )}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TodayFactors({ factors }: { factors: { key: string; label: string; impact: number; icon: string }[] }) {
  if (factors.length === 0) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <CheckCircle size={18} className="text-safeGreen flex-shrink-0" />
        <p className="text-sm text-textSecondary">No active threshold factors logged today.</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-textSecondary mb-3">Active Factors</h3>
      <div className="space-y-2">
        {factors.map((f) => (
          <div key={f.key} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>{f.icon}</span>
              <span className="text-textSecondary">{f.label}</span>
            </div>
            <span className={cn('font-semibold text-xs', f.impact < 0 ? 'text-dangerRed' : 'text-safeGreen')}>
              {f.impact > 0 ? '+' : ''}{f.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { threshold, setAttackMode, cyclePhase, periodStartDate, moonPhaseCache, setMoonPhaseCache, setCyclePhase, checkIns } = useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const checkedInToday = checkIns.some((c) => c.date === today)

  // Compute moon phase (cached daily)
  useEffect(() => {
    if (!moonPhaseCache || moonPhaseCache.date !== today) {
      const info = getMoonPhase()
      setMoonPhaseCache({ date: today, phase: info.phase })
    }
  }, [today, moonPhaseCache, setMoonPhaseCache])

  // Compute cycle phase
  useEffect(() => {
    const info = getCyclePhase(periodStartDate)
    setCyclePhase(info.phase)
  }, [periodStartDate, setCyclePhase])

  const moonPhase = moonPhaseCache?.phase ?? 'new-moon'

  const cereAnimation: 'float' | 'pulse' =
    threshold.zone === 'safe' ? 'float' : 'pulse'

  const cereIntensity: 'calm' | 'pulsing' | 'alert' =
    threshold.zone === 'safe' ? 'calm' : threshold.zone === 'warning' ? 'pulsing' : 'alert'

  function handleAttackMode() {
    setAttackMode(true)
    navigate('/attack')
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">
            {format(new Date(), 'EEEE')}
          </h1>
          <p className="text-sm text-textMuted">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={handleAttackMode}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[44px]',
            threshold.zone === 'danger'
              ? 'bg-dangerRed/15 text-dangerRed border border-dangerRed/30 hover:bg-dangerRed/25'
              : 'bg-surfaceHigh text-textSecondary border border-border hover:text-textPrimary',
          )}
          aria-label="Enter attack mode"
        >
          <Zap size={15} />
          Attack
        </button>
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Cere mascot + greeting */}
        <div className="flex items-end gap-4">
          <AnimatedMascot
            mascot="cere"
            animation={cereAnimation}
            intensity={cereIntensity}
            size={130}
          />
          <div className="card flex-1 p-4 mb-3">
            <p className="text-sm text-textPrimary leading-relaxed">
              {threshold.zone === 'safe'
                ? "You're doing great! Your threshold is well-protected. Keep tracking to maintain this momentum 🌟"
                : threshold.zone === 'warning'
                ? "Your threshold is dropping a bit. Make sure you're staying hydrated and getting enough rest 💛"
                : "Your threshold is quite low right now. Please take it easy — rest, hydrate, and reduce stimulation 🫂"}
            </p>
          </div>
        </div>

        {/* Threshold meter */}
        <ThresholdMeter score={threshold.score} zone={threshold.zone} />

        {/* Daily check-in CTA (shown when not yet done) */}
        {!checkedInToday && (
          <button
            onClick={() => navigate('/check-in')}
            className="w-full card p-4 border-accentViolet/20 hover:border-accentViolet/40 hover:bg-accentViolet/5 transition-all duration-150 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-accentViolet/15 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck size={18} className="text-accentViolet" />
            </div>
            <div>
              <p className="text-sm font-semibold text-textPrimary">Daily check-in</p>
              <p className="text-xs text-textMuted">Update your threshold score — takes 2 minutes</p>
            </div>
            <ChevronRight size={16} className="text-textMuted ml-auto flex-shrink-0" />
          </button>
        )}

        {/* Quick log */}
        <QuickLogCard onCheckIn={() => navigate('/check-in')} />

        {/* "Something feels off" triage */}
        <AmIStartingFlow onStartAttack={handleAttackMode} />

        {/* Active factors */}
        <TodayFactors factors={threshold.factors} />

        {/* Mini tracker widgets */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/trackers/hypa')}
            className="card p-4 text-left hover:bg-surfaceHigh transition-colors duration-150 min-h-[80px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🌸</span>
              <ChevronRight size={14} className="text-textMuted" />
            </div>
            <p className="text-xs font-semibold text-textSecondary">Cycle</p>
            <p className="text-sm font-bold text-textPrimary capitalize mt-0.5">{cyclePhase}</p>
          </button>

          <button
            onClick={() => navigate('/trackers/thalma')}
            className="card p-4 text-left hover:bg-surfaceHigh transition-colors duration-150 min-h-[80px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🌙</span>
              <ChevronRight size={14} className="text-textMuted" />
            </div>
            <p className="text-xs font-semibold text-textSecondary">Moon</p>
            <p className="text-sm font-bold text-textPrimary capitalize mt-0.5">
              {moonPhase.replace(/-/g, ' ')}
            </p>
          </button>

          <button
            onClick={() => navigate('/trackers/osma')}
            className="card p-4 text-left hover:bg-surfaceHigh transition-colors duration-150 min-h-[80px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">💧</span>
              <ChevronRight size={14} className="text-textMuted" />
            </div>
            <p className="text-xs font-semibold text-textSecondary">Hydration</p>
            <p className="text-sm font-bold text-textPrimary">Log water</p>
          </button>

          <button
            onClick={() => navigate('/trackers/greli')}
            className="card p-4 text-left hover:bg-surfaceHigh transition-colors duration-150 min-h-[80px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🌿</span>
              <ChevronRight size={14} className="text-textMuted" />
            </div>
            <p className="text-xs font-semibold text-textSecondary">Nourishment</p>
            <p className="text-sm font-bold text-textPrimary">Log meal</p>
          </button>
        </div>

        {/* Start migraine tracking button -->*/}
        <button
          onClick={handleAttackMode}
          className="w-full card p-4 border-dangerRed/20 hover:border-dangerRed/40 hover:bg-dangerRed/5 transition-all duration-150 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-dangerRed/15 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-dangerRed" />
          </div>
          <div>
            <p className="text-sm font-semibold text-textPrimary">Migraine starting?</p>
            <p className="text-xs text-textMuted">Enter attack mode — step-by-step guidance</p>
          </div>
          <ChevronRight size={16} className="text-textMuted ml-auto flex-shrink-0" />
        </button>
      </div>
    </div>
  )
}
