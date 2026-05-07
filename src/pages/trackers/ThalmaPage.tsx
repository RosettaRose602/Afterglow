import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedMascot } from '@/components/mascots/AnimatedMascot'
import { useAppStore } from '@/store/appStore'
import { getMoonPhase } from '@/lib/moonPhase'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { SleepEntry, DreamEntry, DreamEmotionalTone, DreamTag } from '@/types'

const QUALITY_OPTIONS = [
  { value: 1 as const, emoji: '😫', label: 'Awful' },
  { value: 2 as const, emoji: '😕', label: 'Poor' },
  { value: 3 as const, emoji: '😐', label: 'Fair' },
  { value: 4 as const, emoji: '😊', label: 'Good' },
  { value: 5 as const, emoji: '😴', label: 'Great' },
]

const TONE_OPTIONS: { value: DreamEmotionalTone; label: string; emoji: string }[] = [
  { value: 'neutral',   label: 'Neutral',   emoji: '😶' },
  { value: 'pleasant',  label: 'Pleasant',  emoji: '😊' },
  { value: 'anxious',   label: 'Anxious',   emoji: '😰' },
  { value: 'scary',     label: 'Scary',     emoji: '😨' },
  { value: 'strange',   label: 'Strange',   emoji: '🌀' },
  { value: 'mixed',     label: 'Mixed',     emoji: '🎭' },
]

const TAG_OPTIONS: { value: DreamTag; label: string }[] = [
  { value: 'chasing',         label: 'Chasing / being chased' },
  { value: 'falling',         label: 'Falling' },
  { value: 'flying',          label: 'Flying' },
  { value: 'people-i-know',   label: 'People I know' },
  { value: 'unfamiliar-places', label: 'Unfamiliar places' },
  { value: 'recurring',       label: 'Recurring theme' },
  { value: 'cant-explain',    label: "Can't explain it" },
]

const VIVIDNESS_EMOJI = ['', '🌫️', '☁️', '⛅', '🌤️', '☀️']

export function ThalmaPage() {
  const navigate = useNavigate()
  const { sleepEntries, addSleepEntry, dreamEntries, addDreamEntry, moonPhaseCache } = useAppStore()
  const moonInfo = getMoonPhase()
  const moonPhase = moonPhaseCache?.phase ?? moonInfo.phase

  // Sleep form
  const [bedtime, setBedtime] = useState('23:00')
  const [waketime, setWaketime] = useState('07:00')
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [sleepSaved, setSleepSaved] = useState(false)

  // Dream form
  const [dreamed, setDreamed] = useState<boolean | null>(null)
  const [vividness, setVividness] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [tone, setTone] = useState<DreamEmotionalTone | null>(null)
  const [tags, setTags] = useState<DreamTag[]>([])
  const [dreamNote, setDreamNote] = useState('')
  const [isMedRelated, setIsMedRelated] = useState(false)
  const [dreamSaved, setDreamSaved] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todaySleep = sleepEntries.find((e) => e.date === today)
  const todayDream = dreamEntries.find((e) => e.date === today)

  function getDurationMinutes(bed: string, wake: string): number {
    const [bh, bm] = bed.split(':').map(Number)
    const [wh, wm] = wake.split(':').map(Number)
    let bedMins = bh * 60 + bm
    let wakeMins = wh * 60 + wm
    if (wakeMins <= bedMins) wakeMins += 24 * 60
    return wakeMins - bedMins
  }

  const durationMins = getDurationMinutes(bedtime, waketime)

  function handleSaveSleep() {
    const entry: SleepEntry = {
      id: crypto.randomUUID(),
      date: today,
      bedtimeAt: `${today}T${bedtime}:00`,
      wakeAt: `${today}T${waketime}:00`,
      durationMinutes: durationMins,
      quality: quality ?? 3,
    }
    addSleepEntry(entry)
    setSleepSaved(true)
    setTimeout(() => setSleepSaved(false), 2000)
  }

  function toggleTag(tag: DreamTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handleSaveDream() {
    const entry: DreamEntry = {
      id: crypto.randomUUID(),
      date: today,
      dreamed,
      vividness: dreamed ? (vividness ?? undefined) : undefined,
      emotionalTone: dreamed ? (tone ?? undefined) : undefined,
      tags: dreamed ? tags : [],
      note: dreamNote.trim() || undefined,
      isMedicationRelated: isMedRelated,
    }
    addDreamEntry(entry)
    setDreamSaved(true)
    setTimeout(() => setDreamSaved(false), 2000)
  }

  // Pattern detection: vivid dreams before attacks
  const vividDreamDates = dreamEntries
    .filter((d) => !d.isMedicationRelated && (d.vividness ?? 0) >= 4)
    .map((d) => d.date)

  return (
    <div className="min-h-full">
      <header className="page-header">
        <button onClick={() => navigate('/trackers')} className="btn-ghost p-2 -ml-2 min-h-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-textPrimary">Thalma — Sleep</h1>
        <div className="w-10" />
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Moon phase + mascot */}
        <div className="flex items-end gap-4">
          <AnimatedMascot mascot="thalma" moonPhase={moonPhase} size={120} animation="float" />
          <div className="card flex-1 p-4 mb-2">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-1">Tonight's moon</p>
            <p className="font-bold text-textPrimary capitalize">{moonPhase.replace(/-/g, ' ')}</p>
            <p className="text-xs text-textMuted mt-1">{moonInfo.subtitle}</p>
            <p className="text-xs text-textMuted">Illumination: {Math.round(moonInfo.illumination * 100)}%</p>
          </div>
        </div>

        {/* Sleep log */}
        {!todaySleep ? (
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-textPrimary">Log last night's sleep</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Bedtime</label>
                <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="label-base">Wake time</label>
                <input type="time" value={waketime} onChange={(e) => setWaketime(e.target.value)} className="input-base" />
              </div>
            </div>
            <div className="card-elevated p-3 text-center">
              <p className="text-2xl font-bold text-textPrimary">{(durationMins / 60).toFixed(1)}h</p>
              <p className="text-xs text-textMuted">{durationMins} minutes of sleep</p>
            </div>
            <div>
              <label className="label-base">Sleep quality</label>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuality(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all min-h-[52px]',
                      quality === opt.value
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                        : 'border-border bg-surfaceHigh text-textMuted',
                    )}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveSleep}
              className={cn('btn-primary w-full', sleepSaved && '!bg-safeGreen')}
            >
              {sleepSaved ? '✓ Sleep saved' : 'Save sleep log'}
            </button>
          </div>
        ) : (
          <div className="card p-4 border-safeGreen/20">
            <p className="text-sm font-semibold text-safeGreen">✓ Sleep logged today</p>
            <p className="text-xs text-textMuted mt-1">
              {(todaySleep.durationMinutes / 60).toFixed(1)}h · Quality {todaySleep.quality}/5
            </p>
          </div>
        )}

        {/* Dream journal */}
        {!todayDream ? (
          <div className="card p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">Dream journal</h3>
              <p className="text-xs text-textMuted mt-0.5">Vivid dreams can be a migraine prodrome signal</p>
            </div>

            {/* Did you dream? */}
            <div>
              <label className="label-base">Did you dream last night?</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {([
                  { val: true, label: 'Yes' },
                  { val: false, label: 'No' },
                  { val: null, label: 'Not sure' },
                ] as { val: boolean | null; label: string }[]).map((opt) => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setDreamed(opt.val)}
                    className={cn(
                      'py-3 rounded-xl border text-sm font-medium transition-all min-h-[48px]',
                      dreamed === opt.val
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                        : 'border-border bg-surfaceHigh text-textMuted',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If they dreamed, show detail questions */}
            <AnimatePresence>
              {dreamed === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Vividness */}
                  <div>
                    <label className="label-base">How vivid was it?</label>
                    <div className="flex gap-2 mt-1">
                      {([1, 2, 3, 4, 5] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setVividness(v)}
                          className={cn(
                            'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-xs transition-all min-h-[52px]',
                            vividness === v
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                              : 'border-border bg-surfaceHigh text-textMuted',
                          )}
                        >
                          <span className="text-xl">{VIVIDNESS_EMOJI[v]}</span>
                          {v}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-textMuted mt-1">
                      <span>Faint</span><span>Intense</span>
                    </div>
                  </div>

                  {/* Emotional tone */}
                  <div>
                    <label className="label-base">Emotional tone</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {TONE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setTone(opt.value)}
                          className={cn(
                            'flex items-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all min-h-[40px]',
                            tone === opt.value
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                              : 'border-border bg-surfaceHigh text-textMuted',
                          )}
                        >
                          <span>{opt.emoji}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="label-base">Dream themes (optional)</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {TAG_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleTag(opt.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                            tags.includes(opt.value)
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                              : 'border-border bg-surfaceHigh text-textMuted',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="label-base">Note (optional)</label>
                    <textarea
                      value={dreamNote}
                      onChange={(e) => setDreamNote(e.target.value)}
                      placeholder="Brief description in your words..."
                      rows={2}
                      className="input-base resize-none mt-1"
                    />
                  </div>

                  {/* Medication related */}
                  <button
                    onClick={() => setIsMedRelated((v) => !v)}
                    className={cn(
                      'w-full flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all',
                      isMedRelated
                        ? 'border-warningAmber/50 bg-warningAmber/10 text-warningAmber'
                        : 'border-border bg-surfaceHigh text-textMuted',
                    )}
                  >
                    <span className={cn('w-4 h-4 rounded border flex items-center justify-center text-xs flex-shrink-0',
                      isMedRelated ? 'bg-warningAmber border-warningAmber text-white' : 'border-textMuted')}
                    >
                      {isMedRelated && '✓'}
                    </span>
                    Could this be medication-related?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSaveDream}
              disabled={dreamed === undefined}
              className={cn('btn-primary w-full', dreamSaved && '!bg-safeGreen')}
            >
              {dreamSaved ? '✓ Dream logged' : 'Save dream log'}
            </button>
          </div>
        ) : (
          <div className="card p-4 border-indigo-500/20">
            <p className="text-sm font-semibold text-indigo-400">✓ Dream logged today</p>
            <p className="text-xs text-textMuted mt-1">
              {todayDream.dreamed === null ? 'Not sure' : todayDream.dreamed ? 'Dreamed' : 'No dreams'}
              {todayDream.vividness ? ` · Vividness ${VIVIDNESS_EMOJI[todayDream.vividness]} ${todayDream.vividness}/5` : ''}
              {todayDream.isMedicationRelated ? ' · Flagged med-related' : ''}
            </p>
          </div>
        )}

        {/* Pattern insight */}
        {vividDreamDates.length >= 3 && (
          <div className="card p-4 border-indigo-500/20 bg-indigo-500/5">
            <p className="text-xs font-semibold text-indigo-400 mb-1">🌙 Thalma's pattern note</p>
            <p className="text-xs text-textSecondary">
              You've logged {vividDreamDates.length} vivid dreams (non-medication). Thalma is watching for
              any pattern with your attacks — this data will appear in Cere's weekly insights.
            </p>
          </div>
        )}

        {/* Recent sleep */}
        {sleepEntries.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-textSecondary mb-3">Recent sleep</h3>
            <div className="space-y-2">
              {sleepEntries.slice(0, 7).map((e) => {
                const dream = dreamEntries.find((d) => d.date === e.date)
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                    <span className="text-textMuted">{format(new Date(e.date), 'EEE, MMM d')}</span>
                    <div className="flex items-center gap-3">
                      <span className={cn('text-textSecondary', e.durationMinutes < 420 && 'text-warningAmber')}>
                        {(e.durationMinutes / 60).toFixed(1)}h
                      </span>
                      <span className="text-textMuted">{QUALITY_OPTIONS.find((q) => q.value === e.quality)?.emoji}</span>
                      {dream?.dreamed && !dream.isMedicationRelated && (dream.vividness ?? 0) >= 4 && (
                        <span title="Vivid dream">🌙</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {sleepEntries.length > 0 && (
              <p className="text-xs text-textMuted mt-2">
                Avg: {(sleepEntries.slice(0, 7).reduce((s, e) => s + e.durationMinutes, 0) / Math.min(sleepEntries.length, 7) / 60).toFixed(1)}h
                {' '}·{' '}
                {sleepEntries.slice(0, 7).filter((e) => e.durationMinutes >= 420).length}/{Math.min(sleepEntries.length, 7)} nights ≥7h
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
