import SunCalc from 'suncalc'

export type MoonPhaseName =
  | 'new-moon'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full-moon'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent'

export interface MoonPhaseInfo {
  phase: MoonPhaseName
  illumination: number
  label: string
  subtitle: string
}

export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const { fraction, phase } = SunCalc.getMoonIllumination(date)

  let name: MoonPhaseName
  if (phase < 0.0625 || phase >= 0.9375) name = 'new-moon'
  else if (phase < 0.1875) name = 'waxing-crescent'
  else if (phase < 0.3125) name = 'first-quarter'
  else if (phase < 0.4375) name = 'waxing-gibbous'
  else if (phase < 0.5625) name = 'full-moon'
  else if (phase < 0.6875) name = 'waning-gibbous'
  else if (phase < 0.8125) name = 'last-quarter'
  else name = 'waning-crescent'

  const labels: Record<MoonPhaseName, [string, string]> = {
    'new-moon': ['New Moon', 'Rest'],
    'waxing-crescent': ['Waxing Crescent', 'Intention'],
    'first-quarter': ['First Quarter', 'Action'],
    'waxing-gibbous': ['Waxing Gibbous', 'Build'],
    'full-moon': ['Full Moon', 'Fulfillment'],
    'waning-gibbous': ['Waning Gibbous', 'Release'],
    'last-quarter': ['Last Quarter', 'Reflect'],
    'waning-crescent': ['Waning Crescent', 'Surrender'],
  }

  return {
    phase: name,
    illumination: fraction,
    label: labels[name][0],
    subtitle: labels[name][1],
  }
}
