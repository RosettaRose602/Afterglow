import { differenceInHours, parseISO } from 'date-fns'
import type {
  DailyCheckIn, SleepEntry, HydrationEntry,
  NourishmentEntry, ExerciseEntry, ThresholdFactor, ThresholdState, ThresholdZone,
  DreamEntry,
} from '@/types'
import type { CyclePhaseName } from '@/lib/cyclePhase'

export interface ThresholdInput {
  checkIn: DailyCheckIn | null
  sleepEntry: SleepEntry | null
  cyclePhase: CyclePhaseName
  hydrationEntries: HydrationEntry[]
  nourishmentEntries: NourishmentEntry[]
  exerciseEntries: ExerciseEntry[]
  recentDreamEntry?: DreamEntry | null
}

function zone(score: number): ThresholdZone {
  if (score >= 65) return 'safe'
  if (score >= 35) return 'warning'
  return 'danger'
}

export function computeThreshold(input: ThresholdInput): ThresholdState {
  const { checkIn, sleepEntry, cyclePhase, hydrationEntries, nourishmentEntries, exerciseEntries, recentDreamEntry } = input

  // If nothing logged yet, return a neutral default
  const hasAnyData =
    checkIn !== null ||
    sleepEntry !== null ||
    hydrationEntries.length > 0 ||
    nourishmentEntries.length > 0

  if (!hasAnyData) {
    return { score: 72, zone: 'safe', factors: [] }
  }

  const factors: ThresholdFactor[] = []
  let risk = 0

  // ── Sleep (max 25 pts) ─────────────────────────────────────────────────────
  if (sleepEntry) {
    const hours = sleepEntry.durationMinutes / 60
    if (hours < 7) {
      const pts = Math.min(20, Math.round((7 - hours) * 4))
      risk += pts
      factors.push({ key: 'sleep-hours', label: `Short sleep (${hours.toFixed(1)}h)`, impact: -pts, icon: '😴' })
    }
    if (sleepEntry.quality <= 2) {
      const pts = sleepEntry.quality === 1 ? 8 : 4
      risk += pts
      factors.push({ key: 'sleep-quality', label: 'Poor sleep quality', impact: -pts, icon: '😫' })
    }
  }

  // ── Stress (max 20 pts) ────────────────────────────────────────────────────
  if (checkIn?.stress) {
    const pts = (checkIn.stress - 1) * 5
    if (pts > 0) {
      risk += pts
      factors.push({ key: 'stress', label: 'Elevated stress', impact: -pts, icon: '😓' })
    }
  }

  // ── Cycle phase (max 15 pts) ───────────────────────────────────────────────
  const cycleRisk: Record<CyclePhaseName, number> = {
    menstrual: 15, luteal: 10, ovulation: 5, follicular: 0,
  }
  const cyclePts = cycleRisk[cyclePhase]
  if (cyclePts > 0) {
    risk += cyclePts
    const labels: Record<CyclePhaseName, string> = {
      menstrual: 'Menstrual phase', luteal: 'Luteal phase',
      ovulation: 'Ovulation phase', follicular: '',
    }
    factors.push({ key: 'cycle', label: labels[cyclePhase], impact: -cyclePts, icon: '🌸' })
  }

  // ── Hydration (max 10 pts) — Osma data overrides check-in ─────────────────
  const todayMl = hydrationEntries.reduce((sum, e) => sum + e.amountMl, 0)
  if (todayMl > 0) {
    const glasses = todayMl / 250
    if (glasses < 2) {
      risk += 10
      factors.push({ key: 'hydration', label: 'Dehydrated', impact: -10, icon: '💧' })
    } else if (glasses < 4) {
      risk += 5
      factors.push({ key: 'hydration', label: 'Low hydration', impact: -5, icon: '💧' })
    }
  } else if (checkIn?.hydrationGlasses !== undefined) {
    if (checkIn.hydrationGlasses < 2) {
      risk += 10
      factors.push({ key: 'hydration', label: 'Dehydrated', impact: -10, icon: '💧' })
    } else if (checkIn.hydrationGlasses < 4) {
      risk += 5
      factors.push({ key: 'hydration', label: 'Low hydration', impact: -5, icon: '💧' })
    }
  }

  // ── Weather sensitivity (max 10 pts) ─────────────────────────────────────
  if (checkIn?.weatherSensitivity) {
    const pts = Math.round((checkIn.weatherSensitivity - 1) * 2.5)
    if (pts > 0) {
      risk += pts
      factors.push({ key: 'weather', label: 'Weather sensitivity', impact: -pts, icon: '🌧️' })
    }
  }

  // ── Neck stiffness (max 7 pts) ────────────────────────────────────────────
  if (checkIn?.neckStiffness) {
    const pts = Math.round((checkIn.neckStiffness - 1) * 1.75)
    if (pts > 0) {
      risk += pts
      factors.push({ key: 'neck', label: 'Neck/shoulder tension', impact: -pts, icon: '💆' })
    }
  }

  // ── Light + sound sensitivity (max 8 pts combined) ────────────────────────
  const lightPts = checkIn?.lightSensitivity ? Math.round((checkIn.lightSensitivity - 1) * 2) : 0
  const soundPts = checkIn?.soundSensitivity ? Math.round((checkIn.soundSensitivity - 1) * 2) : 0
  const sensPts = Math.min(8, lightPts + soundPts)
  if (sensPts > 0) {
    risk += sensPts
    factors.push({ key: 'sensitivity', label: 'Light/sound sensitivity', impact: -sensPts, icon: '💡' })
  }

  // ── Mood (max 4 pts — inverted) ───────────────────────────────────────────
  if (checkIn?.mood) {
    const pts = 5 - checkIn.mood
    if (pts > 0) {
      risk += pts
      factors.push({ key: 'mood', label: 'Low mood', impact: -pts, icon: '💜' })
    }
  }

  // ── Prodrome proxies (+3 each, max +6) ────────────────────────────────────
  if (checkIn?.foodCravings) {
    risk += 3
    factors.push({ key: 'cravings', label: 'Food cravings (prodrome signal)', impact: -3, icon: '🍫' })
  }
  if (checkIn?.excessiveYawning) {
    risk += 3
    factors.push({ key: 'yawning', label: 'Excessive yawning (prodrome signal)', impact: -3, icon: '🥱' })
  }
  if (checkIn?.visionChanges) {
    risk += 4
    factors.push({ key: 'vision', label: 'Vision changes (possible aura)', impact: -4, icon: '👁️' })
  }
  if (checkIn?.nausea) {
    risk += 3
    factors.push({ key: 'nausea', label: 'Nausea present', impact: -3, icon: '🤢' })
  }

  // ── Vivid dream signal (+2 pts) — Thalma prodrome proxy ─────────────────
  if (recentDreamEntry && !recentDreamEntry.isMedicationRelated && (recentDreamEntry.vividness ?? 0) >= 4) {
    risk += 2
    factors.push({ key: 'vivid-dream', label: 'Vivid dream (prodrome signal)', impact: -2, icon: '🌙' })
  }

  // ── Meal gap (Greli, max 10 pts) ──────────────────────────────────────────
  if (nourishmentEntries.length > 0) {
    const sorted = [...nourishmentEntries].sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    )
    const hoursSince = differenceInHours(new Date(), parseISO(sorted[0].loggedAt))
    if (hoursSince > 7) {
      risk += 10
      factors.push({ key: 'meal-gap', label: `No meal in ${hoursSince}h`, impact: -10, icon: '🌿' })
    } else if (hoursSince > 5) {
      risk += 5
      factors.push({ key: 'meal-gap', label: 'Long gap since eating', impact: -5, icon: '🌿' })
    }
  }

  // ── Overexertion penalty (+5 when already in caution/danger) ─────────────
  if (risk >= 35) {
    const hasVigorous = exerciseEntries.some((e) => e.intensity === 'vigorous')
    if (hasVigorous) {
      risk += 5
      factors.push({ key: 'overexertion', label: 'Intense exercise while threshold elevated', impact: -5, icon: '⚡' })
    }
  }

  const score = Math.max(0, Math.min(100, 100 - risk))
  return { score, zone: zone(score), factors }
}
