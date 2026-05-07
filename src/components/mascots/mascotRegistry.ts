import type { CyclePhaseName } from '@/types'
import type { MoonPhaseName } from '@/lib/moonPhase'

export type DophiEnergyState = 'rest' | 'low-energy' | 'medium-effort' | 'energized'
export type DophiView = 'front' | 'side' | 'back'
export type DophiVariant = DophiView | DophiEnergyState

export interface MascotMeta {
  domain: string
  mode?: string
  label: string
  primaryColor: string
  accentColor: string
}

export interface MascotEntry {
  src: string
  meta: MascotMeta
}

const BASE = '/mascots'
const EXT = '.png'

export const mascotRegistry = {
  cere: {
    src: `${BASE}/cere${EXT}`,
    meta: {
      domain: 'migraine',
      mode: 'prevention',
      label: 'Cere',
      primaryColor: '#f0d080',
      accentColor: '#e8c040',
    },
  },

  bella: {
    src: `${BASE}/bella${EXT}`,
    meta: {
      domain: 'migraine',
      mode: 'attack',
      label: 'Bella',
      primaryColor: '#b8a8e0',
      accentColor: '#a8d8f0',
    },
  },

  hypa: {
    phases: {
      menstrual: `${BASE}/hypa-menstrual${EXT}`,
      follicular: `${BASE}/hypa-follicular${EXT}`,
      ovulation: `${BASE}/hypa-ovulation${EXT}`,
      luteal: `${BASE}/hypa-luteal${EXT}`,
    } satisfies Record<CyclePhaseName, string>,
    meta: {
      domain: 'cycle',
      label: 'Hypa',
      primaryColor: '#d4a0bc',
      accentColor: '#e8a0c8',
    },
  },

  thalma: {
    moonPhases: {
      'new-moon': `${BASE}/thalma-new-moon${EXT}`,
      'waxing-crescent': `${BASE}/thalma-waxing-crescent${EXT}`,
      'first-quarter': `${BASE}/thalma-first-quarter${EXT}`,
      'waxing-gibbous': `${BASE}/thalma-waxing-gibbous${EXT}`,
      'full-moon': `${BASE}/thalma-full-moon${EXT}`,
      'waning-gibbous': `${BASE}/thalma-waning-gibbous${EXT}`,
      'last-quarter': `${BASE}/thalma-last-quarter${EXT}`,
      'waning-crescent': `${BASE}/thalma-waning-crescent${EXT}`,
    } satisfies Record<MoonPhaseName, string>,
    meta: {
      domain: 'sleep',
      label: 'Thalma',
      primaryColor: '#5058a0',
      accentColor: '#c8d0f0',
    },
  },

  greli: {
    src: `${BASE}/greli${EXT}`,
    meta: {
      domain: 'nourishment',
      label: 'Greli',
      primaryColor: '#78b038',
      accentColor: '#f0c040',
    },
  },

  osma: {
    src: `${BASE}/osma${EXT}`,
    meta: {
      domain: 'hydration',
      label: 'Osma',
      primaryColor: '#50c8f0',
      accentColor: '#a8e8f8',
    },
  },

  dophi: {
    views: {
      front: `${BASE}/dophi-front${EXT}`,
      side: `${BASE}/dophi-side${EXT}`,
      back: `${BASE}/dophi-back${EXT}`,
    } satisfies Record<DophiView, string>,
    energy: {
      rest: `${BASE}/dophi-rest${EXT}`,
      'low-energy': `${BASE}/dophi-low-energy${EXT}`,
      'medium-effort': `${BASE}/dophi-medium-effort${EXT}`,
      energized: `${BASE}/dophi-energized${EXT}`,
    } satisfies Record<DophiEnergyState, string>,
    meta: {
      domain: 'exercise',
      label: 'Dophi',
      primaryColor: '#f08060',
      accentColor: '#f0c040',
    },
  },
} as const

export function getCereSrc() {
  return mascotRegistry.cere.src
}

export function getBellaSrc() {
  return mascotRegistry.bella.src
}

export function getHypaSrc(phase: CyclePhaseName) {
  return mascotRegistry.hypa.phases[phase]
}

export function getThalmasSrc(moonPhase: MoonPhaseName) {
  return mascotRegistry.thalma.moonPhases[moonPhase]
}

export function getGreliSrc() {
  return mascotRegistry.greli.src
}

export function getOsmaSrc() {
  return mascotRegistry.osma.src
}

export function getDophiSrc(variant: DophiVariant) {
  const r = mascotRegistry.dophi
  if (variant in r.views) return r.views[variant as DophiView]
  return r.energy[variant as DophiEnergyState]
}
