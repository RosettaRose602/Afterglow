import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { getMoonPhase } from '@/lib/moonPhase'
import { cn } from '@/lib/utils'

const trackers = [
  {
    path: '/trackers/hypa',
    mascot: 'hypa' as const,
    label: 'Hypa',
    domain: 'Period & Cycle',
    description: 'Track your cycle, flow, and symptoms',
    color: 'from-rose-900/30 to-pink-900/20 border-rose-800/30',
    accent: 'text-rose-400',
  },
  {
    path: '/trackers/thalma',
    mascot: 'thalma' as const,
    label: 'Thalma',
    domain: 'Sleep',
    description: 'Log sleep quality and duration',
    color: 'from-indigo-900/30 to-violet-900/20 border-indigo-800/30',
    accent: 'text-indigo-400',
  },
  {
    path: '/trackers/greli',
    mascot: 'greli' as const,
    label: 'Greli',
    domain: 'Nourishment',
    description: 'Track hunger levels and meals',
    color: 'from-emerald-900/30 to-green-900/20 border-emerald-800/30',
    accent: 'text-emerald-400',
  },
  {
    path: '/trackers/osma',
    mascot: 'osma' as const,
    label: 'Osma',
    domain: 'Hydration',
    description: 'Log water and fluid intake',
    color: 'from-sky-900/30 to-cyan-900/20 border-sky-800/30',
    accent: 'text-sky-400',
  },
  {
    path: '/trackers/dophi',
    mascot: 'dophi' as const,
    label: 'Dophi',
    domain: 'Exercise',
    description: 'Track movement and energy levels',
    color: 'from-orange-900/30 to-amber-900/20 border-orange-800/30',
    accent: 'text-orange-400',
  },
]

export function TrackersHub() {
  const navigate = useNavigate()
  const { cyclePhase, moonPhaseCache } = useAppStore()
  const moonPhase = moonPhaseCache?.phase ?? getMoonPhase().phase

  return (
    <div className="min-h-full">
      <header className="page-header">
        <h1 className="text-2xl font-bold text-textPrimary">Trackers</h1>
      </header>

      <div className="px-4 pb-6 space-y-3">
        {trackers.map(({ path, mascot, label, domain, description, color, accent }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r transition-all duration-150 hover:brightness-110 min-h-[88px]',
              color,
            )}
          >
            <div className="flex-shrink-0">
              <AnimatedMascot
                mascot={mascot}
                cyclePhase={mascot === 'hypa' ? cyclePhase : undefined}
                moonPhase={mascot === 'thalma' ? moonPhase : undefined}
                dophiVariant={mascot === 'dophi' ? 'front' : undefined}
                size={72}
                animation="float"
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className={cn('text-xs font-bold uppercase tracking-wide mb-0.5', accent)}>{domain}</p>
              <p className="text-base font-bold text-textPrimary">{label}</p>
              <p className="text-xs text-textMuted truncate">{description}</p>
            </div>
            <ChevronRight size={18} className="text-textMuted flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
