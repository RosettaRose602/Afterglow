import { differenceInDays } from 'date-fns'

export type CyclePhaseName = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export interface CyclePhaseInfo {
  phase: CyclePhaseName
  day: number
  label: string
  subtitle: string
}

export function getCyclePhase(
  periodStartDate: Date | null,
  cycleLength = 28,
  periodLength = 5,
): CyclePhaseInfo {
  if (!periodStartDate) {
    return { phase: 'follicular', day: 0, label: 'Follicular', subtitle: 'Renew & Grow' }
  }

  const today = new Date()
  const dayOfCycle = (differenceInDays(today, periodStartDate) % cycleLength) + 1

  const ovulationDay = cycleLength - 14

  let phase: CyclePhaseName
  if (dayOfCycle <= periodLength) {
    phase = 'menstrual'
  } else if (dayOfCycle < ovulationDay - 1) {
    phase = 'follicular'
  } else if (dayOfCycle <= ovulationDay + 1) {
    phase = 'ovulation'
  } else {
    phase = 'luteal'
  }

  const labels: Record<CyclePhaseName, [string, string]> = {
    menstrual: ['Menstrual', 'Rest & Reset'],
    follicular: ['Follicular', 'Renew & Grow'],
    ovulation: ['Ovulation', 'Peak & Radiate'],
    luteal: ['Luteal', 'Nourish & Reflect'],
  }

  return {
    phase,
    day: dayOfCycle,
    label: labels[phase][0],
    subtitle: labels[phase][1],
  }
}
