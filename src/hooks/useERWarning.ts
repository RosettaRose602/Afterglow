import { useMemo } from 'react'
import { differenceInHours, parseISO } from 'date-fns'
import { assessERRisk } from '@/services/erWarning.service'
import { useAppStore } from '@/store/appStore'
import type { ERWarningResult } from '@/services/erWarning.service'

export function useERWarning(): ERWarningResult {
  const { activeAttack, user } = useAppStore()

  return useMemo(() => {
    if (!activeAttack) {
      return { level: 'none', reason: '', cocktailText: null }
    }

    const durationHours = differenceInHours(
      new Date(),
      parseISO(activeAttack.startedAt),
    )

    const typicalSymptoms = user?.migraineProfile?.knownTriggers ?? []

    return assessERRisk({
      painLevel: activeAttack.painLevel,
      durationHours,
      symptoms: activeAttack.symptoms,
      typicalSymptoms,
      rescuePlanStepsTotal: 0,    // TODO: wire up rescue plan steps
      rescuePlanStepsCompleted: 0,
      thunderclapOnset: false,    // TODO: wire up thunderclap flag
      userFeelsUnsafe: false,     // TODO: wire up user-feels-unsafe flag
      somethingDifferent: false,  // TODO: wire up something-different flag
    })
  }, [activeAttack, user])
}
