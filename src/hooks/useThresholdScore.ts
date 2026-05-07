import { useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { useAppStore } from '@/store/appStore'
import { computeThreshold } from '@/services/threshold.service'

export function useThresholdScore() {
  const {
    checkIns, sleepEntries, cyclePhase,
    hydrationEntries, nourishmentEntries, exerciseEntries,
    dreamEntries,
    setThreshold,
  } = useAppStore()

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    const checkIn = checkIns.find((c) => c.date === today) ?? null
    const sleepEntry = sleepEntries.find((s) => s.date === today) ?? null

    // Most recent non-medication dream from today or yesterday
    const recentDreamEntry =
      dreamEntries.find((d) => d.date === today) ??
      dreamEntries.find((d) => d.date === yesterday) ??
      null

    const todayHydration = hydrationEntries.filter((h) => h.loggedAt.startsWith(today))
    const todayNourishment = nourishmentEntries.filter((n) => n.loggedAt.startsWith(today))
    const todayExercise = exerciseEntries.filter((e) => e.loggedAt.startsWith(today))

    const result = computeThreshold({
      checkIn,
      sleepEntry,
      cyclePhase,
      hydrationEntries: todayHydration,
      nourishmentEntries: todayNourishment,
      exerciseEntries: todayExercise,
      recentDreamEntry,
    })

    setThreshold(result)
  }, [checkIns, sleepEntries, cyclePhase, hydrationEntries, nourishmentEntries, exerciseEntries, dreamEntries, setThreshold])
}
