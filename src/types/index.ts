// ─── Threshold ────────────────────────────────────────────────────────────────

export type ThresholdZone = 'safe' | 'warning' | 'danger'

export interface ThresholdState {
  score: number        // 0–100, lower = closer to migraine
  zone: ThresholdZone
  factors: ThresholdFactor[]
}

export interface ThresholdFactor {
  key: string
  label: string
  impact: number       // negative = lowers threshold
  icon: string
}

// ─── Migraine ─────────────────────────────────────────────────────────────────

export type MigrainePhase = 'prodrome' | 'aura' | 'headache' | 'postdrome'
export type PainSide = 'left' | 'right' | 'both' | 'migrating'
export type PainScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface SelectedSymptom {
  id: string
  severity: 1 | 2 | 3 | 4 | 5
}

export interface WaveEntry {
  id: string
  attackId: string
  loggedAt: string
  pain: number        // 1–10
  nausea?: number     // 1–5
}

export interface AttackCheckIn {
  id: string
  attackId: string
  loggedAt: string
  symptoms: SelectedSymptom[]
  painLevel: number
  notes?: string
}

export interface MigraineAttack {
  id: string
  startedAt: string
  endedAt?: string
  phase: MigrainePhase
  painLevel: PainScale
  painSide: PainSide
  symptoms: string[]
  selectedSymptoms: SelectedSymptom[]
  triggers: string[]
  treatments: Treatment[]
  notes?: string
  attackStory?: string
  erWarning: boolean
  waveLog: WaveEntry[]
  checkIns: AttackCheckIn[]
}

export interface Treatment {
  id: string
  name: string
  type: 'medication' | 'ice' | 'dark-room' | 'hydration' | 'sleep' | 'other'
  takenAt: string
  dose?: string
}

// ─── Trackers ─────────────────────────────────────────────────────────────────

export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy'
export type CyclePhaseName = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export interface CycleEntry {
  id: string
  date: string
  flow?: FlowLevel
  symptoms: string[]
  notes?: string
}

export interface SleepEntry {
  id: string
  date: string
  bedtimeAt: string
  wakeAt: string
  durationMinutes: number
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export type DreamEmotionalTone = 'neutral' | 'pleasant' | 'anxious' | 'scary' | 'strange' | 'mixed'
export type DreamTag =
  | 'chasing'
  | 'falling'
  | 'flying'
  | 'people-i-know'
  | 'unfamiliar-places'
  | 'recurring'
  | 'cant-explain'

export interface DreamEntry {
  id: string
  date: string
  dreamed: boolean | null       // null = not sure
  vividness?: 1 | 2 | 3 | 4 | 5
  emotionalTone?: DreamEmotionalTone
  tags: DreamTag[]
  note?: string
  isMedicationRelated: boolean
}

export type HungerLevel = 1 | 2 | 3 | 4 | 5
export interface NourishmentEntry {
  id: string
  loggedAt: string
  hunger: HungerLevel
  ate: boolean
  meal?: string
  notes?: string
}

export type HydrationUnit = 'ml' | 'oz'
export interface HydrationEntry {
  id: string
  loggedAt: string
  amountMl: number
  notes?: string
}

export type ExerciseIntensity = 'rest' | 'light' | 'moderate' | 'vigorous'
export interface ExerciseEntry {
  id: string
  loggedAt: string
  intensity: ExerciseIntensity
  durationMinutes: number
  type?: string
  notes?: string
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export interface DailyCheckIn {
  id: string
  date: string
  // Core
  mood: 1 | 2 | 3 | 4 | 5
  stress: 1 | 2 | 3 | 4 | 5
  energy: 1 | 2 | 3 | 4 | 5
  // Body
  neckStiffness?: 1 | 2 | 3 | 4 | 5
  // Sensitivities
  lightSensitivity?: 1 | 2 | 3 | 4 | 5
  soundSensitivity?: 1 | 2 | 3 | 4 | 5
  weatherSensitivity?: 1 | 2 | 3 | 4 | 5
  // Prodrome signals
  foodCravings?: boolean
  excessiveYawning?: boolean
  visionChanges?: boolean
  nausea?: boolean
  // Hydration fallback (if no Osma entry today)
  hydrationGlasses?: number
  notes?: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  timezone: string
  migraineProfile: MigraineProfile
  preferences: UserPreferences
}

export interface MigraineProfile {
  averageCycleLength?: number
  averagePeriodLength?: number
  knownTriggers: string[]
  preventiveMeds: string[]
  abortiveMeds: string[]
  erThreshold: PainScale
}

export interface UserPreferences {
  reducedMotion: boolean
  fontSize: 'normal' | 'large' | 'xl'
  notifications: boolean
  theme: 'dark'
  hydrationTarget: number
  hydrationUnit: HydrationUnit
}
