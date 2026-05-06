import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Phone, X, ClipboardCopy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ERWarningResult } from '@/services/erWarning.service'

interface Props {
  warning: ERWarningResult
}

export function ERWarningBanner({ warning }: Props) {
  const [showCocktail, setShowCocktail] = useState(false)
  const [copied, setCopied] = useState(false)

  if (warning.level === 'none') return null

  const isGoNow = warning.level === 'go_now'
  const isCallProvider = warning.level === 'call_provider'

  function copyToClipboard() {
    if (warning.cocktailText) {
      navigator.clipboard.writeText(warning.cocktailText).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl p-4 border',
          isGoNow
            ? 'bg-dangerRed/10 border-dangerRed/30'
            : isCallProvider
            ? 'bg-warningAmber/10 border-warningAmber/30'
            : 'bg-warningAmber/5 border-warningAmber/20',
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={20}
            className={cn(
              'flex-shrink-0 mt-0.5',
              isGoNow ? 'text-dangerRed' : 'text-warningAmber',
            )}
          />
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-bold mb-1',
              isGoNow ? 'text-dangerRed' : 'text-warningAmber',
            )}>
              {isGoNow ? '🚨 Go to the ER now' : isCallProvider ? '📞 Contact your provider' : '⚠️ Monitor closely'}
            </p>
            <p className="text-xs text-textSecondary leading-relaxed">{warning.reason}</p>

            {isGoNow && warning.cocktailText && (
              <button
                onClick={() => setShowCocktail(true)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-dangerRed hover:text-rose-300 transition-colors"
              >
                <ClipboardCopy size={13} />
                Show ER cocktail card
              </button>
            )}
            {isCallProvider && (
              <a
                href="tel:"
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-warningAmber hover:text-amber-300 transition-colors"
              >
                <Phone size={13} />
                Call provider
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cocktail card overlay */}
      <AnimatePresence>
        {showCocktail && warning.cocktailText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl border border-dangerRed/30 p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-dangerRed">ER Cocktail Card</h2>
                <button
                  onClick={() => setShowCocktail(false)}
                  className="p-1 text-textMuted hover:text-textPrimary"
                >
                  <X size={18} />
                </button>
              </div>
              <pre className="text-xs text-textPrimary leading-relaxed whitespace-pre-wrap font-sans">
                {warning.cocktailText}
              </pre>
              <button
                onClick={copyToClipboard}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-dangerRed/15 border border-dangerRed/30 text-dangerRed text-sm font-semibold hover:bg-dangerRed/25 transition-colors"
              >
                <ClipboardCopy size={15} />
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
