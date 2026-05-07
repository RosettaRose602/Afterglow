import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { SelectedSymptom } from '@/types'

// ─── Symptom catalog ─────────────────────────────────────────────────────────

interface SymptomDef {
  id: string
  emoji: string
  label: string
}

interface SymptomGroup {
  heading: string
  symptoms: SymptomDef[]
}

const SYMPTOM_GROUPS: SymptomGroup[] = [
  {
    heading: 'Head & Senses',
    symptoms: [
      { id: 'headache-throb',   emoji: '🥁', label: 'Throbbing head' },
      { id: 'headache-press',   emoji: '🗜️', label: 'Pressure head' },
      { id: 'headache-stab',    emoji: '⚡', label: 'Stabbing head' },
      { id: 'headache-one-side',emoji: '↔️', label: 'One-side head' },
      { id: 'light-sensitive',  emoji: '💡', label: 'Light sensitive' },
      { id: 'sound-sensitive',  emoji: '🔊', label: 'Sound sensitive' },
      { id: 'smell-sensitive',  emoji: '👃', label: 'Smell sensitive' },
      { id: 'vision-zigzag',    emoji: '〰️', label: 'Zigzags / aura' },
      { id: 'vision-blindspot', emoji: '⬛', label: 'Blind spot' },
      { id: 'vision-blurry',    emoji: '🌫️', label: 'Blurry vision' },
      { id: 'tinnitus',         emoji: '🔔', label: 'Ear ringing' },
      { id: 'eye-pain',         emoji: '👁️', label: 'Eye pain' },
      { id: 'face-droop',       emoji: '😶', label: 'Face heaviness' },
      { id: 'jaw-tight',        emoji: '😬', label: 'Jaw tightness' },
    ],
  },
  {
    heading: 'Neurological & Motor',
    symptoms: [
      { id: 'weakness-left',    emoji: '🫲', label: 'Left-side weak' },
      { id: 'weakness-right',   emoji: '🫱', label: 'Right-side weak' },
      { id: 'arm-weakness',     emoji: '💪', label: 'Arm weakness' },
      { id: 'leg-weakness',     emoji: '🦵', label: 'Leg weakness' },
      { id: 'balance',          emoji: '🌀', label: 'Balance / wobble' },
      { id: 'tremors',          emoji: '〰️', label: 'Tremors / shake' },
      { id: 'coordination',     emoji: '🤸', label: 'Coordination off' },
      { id: 'neck-stiff',       emoji: '🔒', label: 'Neck stiffness' },
      { id: 'shoulder-tight',   emoji: '🧍', label: 'Shoulder tension' },
    ],
  },
  {
    heading: 'Communication & Cognitive',
    symptoms: [
      { id: 'speech-diff',      emoji: '💬', label: 'Speech difficulty' },
      { id: 'slurred-speech',   emoji: '🗣️', label: 'Slurred speech' },
      { id: 'cant-understand',  emoji: '❓', label: "Can't understand" },
      { id: 'brain-fog',        emoji: '🧠', label: 'Brain fog' },
      { id: 'memory-blanks',    emoji: '🕳️', label: 'Memory blanks' },
      { id: 'confusion',        emoji: '😵', label: 'Confused' },
      { id: 'trouble-reading',  emoji: '📖', label: 'Trouble reading' },
      { id: 'trouble-typing',   emoji: '⌨️', label: 'Trouble typing' },
    ],
  },
  {
    heading: 'Body & Stomach',
    symptoms: [
      { id: 'nausea',           emoji: '🤢', label: 'Nausea' },
      { id: 'vomiting',         emoji: '🤮', label: 'Vomiting' },
      { id: 'stomach-pain',     emoji: '🫃', label: 'Stomach pain' },
      { id: 'appetite-loss',    emoji: '🚫', label: 'No appetite' },
      { id: 'food-cravings',    emoji: '🍫', label: 'Food cravings' },
      { id: 'yawning',          emoji: '🥱', label: 'Yawning a lot' },
      { id: 'fatigue',          emoji: '🪫', label: 'Exhausted' },
      { id: 'body-aches',       emoji: '💢', label: 'Body aches' },
      { id: 'chills',           emoji: '🥶', label: 'Chills / hot' },
      { id: 'urination',        emoji: '🚿', label: 'Frequent urination' },
    ],
  },
  {
    heading: 'Mood & Feeling',
    symptoms: [
      { id: 'irritable',        emoji: '😤', label: 'Irritable' },
      { id: 'anxious',          emoji: '😰', label: 'Anxious / scared' },
      { id: 'weepy',            emoji: '😢', label: 'Weepy / emotional' },
      { id: 'euphoric',         emoji: '🌟', label: 'Unusually happy' },
      { id: 'feeling-off',      emoji: '😶', label: "Something's off" },
    ],
  },
]

const SEVERITY_EMOJI = ['', '😶', '😟', '😣', '😖', '😭']

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  selected: SelectedSymptom[]
  onChange: (updated: SelectedSymptom[]) => void
  /** If provided, only show these symptom IDs (for quick re-check-in) */
  pinned?: string[]
}

export function SymptomGrid({ selected, onChange, pinned }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const selectedMap = new Map(selected.map((s) => [s.id, s.severity]))

  function toggle(id: string) {
    if (selectedMap.has(id)) {
      onChange(selected.filter((s) => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    } else {
      onChange([...selected, { id, severity: 3 }])
      setExpandedId(id)
    }
  }

  function setSeverity(id: string, severity: 1 | 2 | 3 | 4 | 5) {
    onChange(selected.map((s) => (s.id === id ? { ...s, severity } : s)))
  }

  const groups = pinned
    ? [
        {
          heading: 'Current symptoms',
          symptoms: SYMPTOM_GROUPS.flatMap((g) => g.symptoms).filter((s) =>
            pinned.includes(s.id),
          ),
        },
        ...SYMPTOM_GROUPS.map((g) => ({
          ...g,
          symptoms: g.symptoms.filter((s) => !pinned.includes(s.id)),
        })).filter((g) => g.symptoms.length > 0),
      ]
    : SYMPTOM_GROUPS

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.heading}>
          <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-2">
            {group.heading}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {group.symptoms.map((sym) => {
              const isSelected = selectedMap.has(sym.id)
              const severity = selectedMap.get(sym.id)
              const isExpanded = expandedId === sym.id

              return (
                <div key={sym.id}>
                  <button
                    onClick={() => {
                      if (isSelected) {
                        setExpandedId(isExpanded ? null : sym.id)
                      } else {
                        toggle(sym.id)
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-150 min-h-[48px] text-left',
                      isSelected
                        ? severity && severity >= 4
                          ? 'border-dangerRed/50 bg-dangerRed/10 text-dangerRed'
                          : severity && severity >= 3
                          ? 'border-warningAmber/50 bg-warningAmber/10 text-warningAmber'
                          : 'border-accentViolet/50 bg-accentViolet/10 text-accentViolet'
                        : 'border-border bg-surfaceHigh text-textMuted hover:text-textPrimary hover:border-border/80',
                    )}
                  >
                    <span className="text-base flex-shrink-0">{sym.emoji}</span>
                    <span className="flex-1 leading-tight">{sym.label}</span>
                    {isSelected && severity && (
                      <span className="text-base flex-shrink-0">{SEVERITY_EMOJI[severity]}</span>
                    )}
                  </button>

                  {/* Severity picker */}
                  <AnimatePresence>
                    {isSelected && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-1 px-1">
                          <div className="flex gap-1 justify-between">
                            {([1, 2, 3, 4, 5] as const).map((v) => (
                              <button
                                key={v}
                                onClick={() => {
                                  setSeverity(sym.id, v)
                                  setExpandedId(null)
                                }}
                                className={cn(
                                  'flex-1 flex flex-col items-center py-1.5 rounded-lg border text-xs transition-all',
                                  severity === v
                                    ? 'border-accentViolet bg-accentViolet/15 text-accentViolet'
                                    : 'border-border bg-surfaceHigh text-textMuted',
                                )}
                              >
                                <span className="text-base">{SEVERITY_EMOJI[v]}</span>
                                <span>{v}</span>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => toggle(sym.id)}
                            className="w-full mt-1 text-xs text-textMuted hover:text-dangerRed transition-colors py-1"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
