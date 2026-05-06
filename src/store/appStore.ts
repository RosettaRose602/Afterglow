import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MigraineAttack, CycleEntry, SleepEntry, NourishmentEntry,
  HydrationEntry, ExerciseEntry, DailyCheckIn, UserProfile,
  ThresholdState, ThresholdZone,
} from '@/types'
import type { MoonPhaseName } from '@/lib/moonPhase'
import type { CyclePhaseName } from '@/lib/cyclePhase'

interface AppStore {
  // ─── App mode ───────────────────────────────────────────────────────────────
  isAttackMode: boolean
  setAttackMode: (v: boolean) => void

  // ─── User ────────────────────────────────────────────────────────────────────
  user: UserProfile | null
  setUser: (u: UserProfile | null) => void

  // ─── Threshold ───────────────────────────────────────────────────────────────
  threshold: ThresholdState
  setThreshold: (t: ThresholdState) => void

  // ─── Active attack ────────────────────────────────────────────────────────────
  activeAttack: MigraineAttack | null
  setActiveAttack: (a: MigraineAttack | null) => void

  // ─── Cycle ────────────────────────────────────────────────────────────────────
  cycleEntries: CycleEntry[]
  cyclePhase: CyclePhaseName
  periodStartDate: Date | null
  addCycleEntry: (e: CycleEntry) => void
  setCyclePhase: (p: CyclePhaseName) => void
  setPeriodStartDate: (d: Date | null) => void

  // ─── Sleep ───────────────────────────────────────────────────────────────────
  sleepEntries: SleepEntry[]
  addSleepEntry: (e: SleepEntry) => void

  // ─── Moon phase cache ─────────────────────────────────────────────────────────
  moonPhaseCache: { date: string; phase: MoonPhaseName } | null
  setMoonPhaseCache: (c: { date: string; phase: MoonPhaseName }) => void

  // ─── Nourishment ──────────────────────────────────────────────────────────────
  nourishmentEntries: NourishmentEntry[]
  addNourishmentEntry: (e: NourishmentEntry) => void

  // ─── Hydration ────────────────────────────────────────────────────────────────
  hydrationEntries: HydrationEntry[]
  addHydrationEntry: (e: HydrationEntry) => void

  // ─── Exercise ─────────────────────────────────────────────────────────────────
  exerciseEntries: ExerciseEntry[]
  addExerciseEntry: (e: ExerciseEntry) => void

  // ─── Check-ins ────────────────────────────────────────────────────────────────
  checkIns: DailyCheckIn[]
  addCheckIn: (c: DailyCheckIn) => void
}

function computeZone(score: number): ThresholdZone {
  if (score >= 65) return 'safe'
  if (score >= 35) return 'warning'
  return 'danger'
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isAttackMode: false,
      setAttackMode: (v) => set({ isAttackMode: v }),

      user: null,
      setUser: (u) => set({ user: u }),

      threshold: { score: 72, zone: 'safe', factors: [] },
      setThreshold: (t) => set({ threshold: { ...t, zone: computeZone(t.score) } }),

      activeAttack: null,
      setActiveAttack: (a) => set({ activeAttack: a }),

      cycleEntries: [],
      cyclePhase: 'follicular',
      periodStartDate: null,
      addCycleEntry: (e) => set((s) => ({ cycleEntries: [e, ...s.cycleEntries] })),
      setCyclePhase: (p) => set({ cyclePhase: p }),
      setPeriodStartDate: (d) => set({ periodStartDate: d }),

      sleepEntries: [],
      addSleepEntry: (e) => set((s) => ({ sleepEntries: [e, ...s.sleepEntries] })),

      moonPhaseCache: null,
      setMoonPhaseCache: (c) => set({ moonPhaseCache: c }),

      nourishmentEntries: [],
      addNourishmentEntry: (e) => set((s) => ({ nourishmentEntries: [e, ...s.nourishmentEntries] })),

      hydrationEntries: [],
      addHydrationEntry: (e) => set((s) => ({ hydrationEntries: [e, ...s.hydrationEntries] })),

      exerciseEntries: [],
      addExerciseEntry: (e) => set((s) => ({ exerciseEntries: [e, ...s.exerciseEntries] })),

      checkIns: [],
      addCheckIn: (c) => set((s) => ({ checkIns: [c, ...s.checkIns] })),
    }),
    {
      name: 'afterglow-store',
      partialize: (s) => ({
        cycleEntries: s.cycleEntries,
        cyclePhase: s.cyclePhase,
        periodStartDate: s.periodStartDate,
        sleepEntries: s.sleepEntries,
        moonPhaseCache: s.moonPhaseCache,
        nourishmentEntries: s.nourishmentEntries,
        hydrationEntries: s.hydrationEntries,
        exerciseEntries: s.exerciseEntries,
        checkIns: s.checkIns,
        user: s.user,
        threshold: s.threshold,
      }),
    },
  ),
)
