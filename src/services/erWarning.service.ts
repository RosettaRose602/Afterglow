// ER Warning algorithm calibrated for hemiplegic migraine.
//
// The user's baseline symptoms include one-sided weakness, speech difficulty,
// tremors, and severe balance loss ("wobble cat"). These overlap with stroke
// screening criteria and MUST NOT trigger `go_now` on their own to avoid
// alarm fatigue. `go_now` requires thunderclap onset, extreme duration, new
// symptoms never logged before, or the user explicitly reporting feeling unsafe.

export type ERLevel = 'none' | 'monitor' | 'call_provider' | 'go_now'

export interface ERWarningInput {
  painLevel: number              // 1–10
  durationHours: number
  symptoms: string[]             // current attack symptoms
  typicalSymptoms: string[]      // user's usual attack symptoms (from profile)
  rescuePlanStepsTotal: number
  rescuePlanStepsCompleted: number
  thunderclapOnset: boolean      // sudden max-pain within 1 min
  userFeelsUnsafe: boolean
  somethingDifferent: boolean    // user said "this feels different/new"
}

export interface ERWarningResult {
  level: ERLevel
  reason: string
  cocktailText: string | null
}

// Symptoms that are typical for hemiplegic migraine — should NOT auto-trigger
// go_now on their own because the user experiences them routinely.
const HEMIPLEGIC_BASELINE = [
  'weakness', 'one-sided weakness', 'arm weakness', 'leg weakness',
  'speech', 'speech difficulty', 'slurred speech', 'balance', 'wobble',
  'tremors', 'coordination',
]

function isTypicalOnly(symptoms: string[], typicalSymptoms: string[]): boolean {
  const normalized = symptoms.map((s) => s.toLowerCase())
  const typical = [...typicalSymptoms.map((s) => s.toLowerCase()), ...HEMIPLEGIC_BASELINE]
  return normalized.every((s) => typical.some((t) => s.includes(t) || t.includes(s)))
}

export function assessERRisk(input: ERWarningInput): ERWarningResult {
  const {
    painLevel,
    durationHours,
    symptoms,
    typicalSymptoms,
    rescuePlanStepsTotal,
    rescuePlanStepsCompleted,
    thunderclapOnset,
    userFeelsUnsafe,
    somethingDifferent,
  } = input

  const allRescueTried =
    rescuePlanStepsTotal > 0 && rescuePlanStepsCompleted >= rescuePlanStepsTotal
  const onlyTypicalSymptoms = isTypicalOnly(symptoms, typicalSymptoms)

  // ── go_now conditions ────────────────────────────────────────────────────
  if (thunderclapOnset) {
    return {
      level: 'go_now',
      reason: 'Thunderclap onset — sudden maximum-intensity headache. This can indicate a serious emergency and needs immediate evaluation.',
      cocktailText: buildCocktailText(),
    }
  }

  if (durationHours >= 72) {
    return {
      level: 'go_now',
      reason: 'This attack has lasted 72+ hours (Status Migrainosus). IV treatment is needed.',
      cocktailText: buildCocktailText(),
    }
  }

  if (userFeelsUnsafe && painLevel >= 8) {
    return {
      level: 'go_now',
      reason: "You said you feel unsafe and pain is severe. Trust your instincts — go to the ER.",
      cocktailText: buildCocktailText(),
    }
  }

  if (allRescueTried && !onlyTypicalSymptoms && somethingDifferent && painLevel >= 7) {
    return {
      level: 'go_now',
      reason: 'All rescue steps tried, pain unchanged, and something feels different from your usual attacks. Time to get evaluated.',
      cocktailText: buildCocktailText(),
    }
  }

  // ── call_provider conditions ─────────────────────────────────────────────
  if (durationHours >= 24 && allRescueTried && painLevel >= 6) {
    return {
      level: 'call_provider',
      reason: "24+ hours with all rescue steps tried and ongoing pain. Contact your neurologist or their on-call line.",
      cocktailText: null,
    }
  }

  if (durationHours >= 48 && painLevel >= 5) {
    return {
      level: 'call_provider',
      reason: "This attack is approaching 48 hours. Consider calling your provider even if pain is manageable.",
      cocktailText: null,
    }
  }

  // ── monitor conditions ───────────────────────────────────────────────────
  // Hemiplegic symptoms alone trigger monitor, not go_now
  const hasHemiplegicSymptoms = symptoms.some((s) =>
    HEMIPLEGIC_BASELINE.some((h) => s.toLowerCase().includes(h)),
  )

  if (hasHemiplegicSymptoms && !onlyTypicalSymptoms) {
    return {
      level: 'monitor',
      reason: 'Some symptoms are outside your typical pattern. Keep tracking — if anything worsens or feels truly different, escalate.',
      cocktailText: null,
    }
  }

  if (painLevel >= 9 && durationHours >= 4) {
    return {
      level: 'monitor',
      reason: "Pain at 9–10 for 4+ hours. Monitor closely — if rescue meds don't help within their expected window, consider the ER.",
      cocktailText: null,
    }
  }

  return { level: 'none', reason: '', cocktailText: null }
}

function buildCocktailText(): string {
  return [
    'MIGRAINE PROTOCOL REQUEST',
    '',
    'Please administer migraine cocktail:',
    '• IV Compazine (prochlorperazine) 10mg',
    '• IV Benadryl (diphenhydramine) 25mg',
    '• IV Toradol (ketorolac) 30mg',
    '• Normal saline 1L',
    '',
    'Patient has hemiplegic migraine (known diagnosis).',
    'One-sided weakness, speech difficulty, and balance loss',
    'are TYPICAL for this patient — please rule out stroke',
    'per protocol, but these are her baseline symptoms.',
  ].join('\n')
}
