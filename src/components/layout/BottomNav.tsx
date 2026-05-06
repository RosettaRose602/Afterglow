import { NavLink } from 'react-router-dom'
import { Home, Zap, LayoutGrid, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/',        icon: Home,        label: 'Dashboard' },
  { to: '/attack',  icon: Zap,         label: 'Attack', isAttack: true },
  { to: '/trackers',icon: LayoutGrid,  label: 'Trackers' },
  { to: '/history', icon: History,     label: 'History' },
  { to: '/settings',icon: Settings,    label: 'Settings' },
]

export function BottomNav() {
  const threshold = useAppStore((s) => s.threshold)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t border-border safe-area-bottom lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label, isAttack }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] transition-colors duration-150',
                isActive ? 'text-accentViolet' : 'text-textMuted hover:text-textSecondary',
                isAttack && threshold.zone === 'danger' && 'text-dangerRed',
                isAttack && threshold.zone === 'warning' && 'text-warningAmber',
              )
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                {isAttack ? (
                  <motion.div
                    animate={
                      threshold.zone !== 'safe'
                        ? { scale: [1, 1.15, 1] }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  </motion.div>
                ) : (
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                )}
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
