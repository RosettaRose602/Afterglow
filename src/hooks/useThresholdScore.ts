import { useEffect } from 'react'
import { format } from 'date-fns'
import { useAppStore } from '@/store/appStore'
import { computeThreshold } from '@/services/threshold.service'

export function useThresholdScore() {
  const {
    checkIns, sleepEntries, cyclePhase,
    hydrationEntries, nourishmentEntries, exerciseEntries,
    setThreshold,
  } = useAppStore()

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')

    const checkIn = checkIns.find((c) => c.date === today) ?? null
    const sleepEntry = sleepEntries.find((s) => s.date === today) ?? null

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
    })

    setThreshold(result)
  }, [checkIns, sleepEntries, cyclePhase, hydrationEntries, nourishmentEntries, exerciseEntries, setThreshold])
}
