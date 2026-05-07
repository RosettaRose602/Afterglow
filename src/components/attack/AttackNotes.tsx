import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/appStore'

export function AttackNotes() {
  const { activeAttack, updateActiveAttackNotes } = useAppStore()
  const [value, setValue] = useState(activeAttack?.notes ?? '')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save 2s after last keystroke
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateActiveAttackNotes(value)
      setSavedAt(new Date())
    }, 2000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, updateActiveAttackNotes])

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-textSecondary">Notes</h3>
        {savedAt && (
          <span className="text-[10px] text-textMuted">
            Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Anything worth noting — where you were, what you were doing, unusual stressors... (auto-saves)"
        rows={3}
        className="input-base resize-none text-sm"
      />
    </div>
  )
}
