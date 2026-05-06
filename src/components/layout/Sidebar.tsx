import { NavLink } from 'react-router-dom'
import { Home, Zap, LayoutGrid, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/',        icon: Home,        label: 'Dashboard' },
  { to: '/attack',  icon: Zap,         label: 'Attack Mode', isAttack: true },
  { to: '/trackers',icon: LayoutGrid,  label: 'Trackers' },
  { to: '/history', icon: History,     label: 'History' },
  { to: '/settings',icon: Settings,    label: 'Settings' },
]

export function Sidebar() {
  const threshold = useAppStore((s) => s.threshold)

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <h1 className="text-xl font-bold text-gradient-violet">Afterglow</h1>
        <p className="text-xs text-textMuted mt-0.5">Migraine companion</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label, isAttack }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 min-h-[44px]',
                isActive
                  ? 'bg-accentViolet/15 text-accentViolet'
                  : 'text-textSecondary hover:bg-surfaceHigh hover:text-textPrimary',
                isAttack && threshold.zone === 'danger' && 'text-dangerRed hover:bg-dangerRed/10',
                isAttack && threshold.zone === 'warning' && 'text-warningAmber hover:bg-warningAmber/10',
              )
            }
          >
            {isAttack && threshold.zone !== 'safe' ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Icon size={18} />
              </motion.div>
            ) : (
              <Icon size={18} />
            )}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Threshold indicator */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-textMuted font-medium">Threshold</span>
          <span
            className={cn(
              'text-xs font-semibold',
              threshold.zone === 'safe' && 'text-safeGreen',
              threshold.zone === 'warning' && 'text-warningAmber',
              threshold.zone === 'danger' && 'text-dangerRed',
            )}
          >
            {threshold.score}%
          </span>
        </div>
        <div className="h-2 bg-surfaceHigh rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              threshold.zone === 'safe' && 'bg-safeGreen',
              threshold.zone === 'warning' && 'bg-warningAmber',
              threshold.zone === 'danger' && 'bg-dangerRed',
            )}
            animate={{ width: `${threshold.score}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </aside>
  )
}
