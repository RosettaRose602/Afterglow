import { format, parseISO } from 'date-fns'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

// Symptom IDs that we want to show compactly in the timeline
const TIMELINE_SYMPTOMS = [
  { id: 'headache-throb',   short: 'Head' },
  { id: 'headache-one-side',short: 'Head1' },
  { id: 'nausea',           short: 'Nausea' },
  { id: 'vision-zigzag',    short: 'Vision' },
  { id: 'vision-blindspot', short: 'Vision' },
  { id: 'vision-blurry',    short: 'Blur' },
  { id: 'weakness-left',    short: 'Weak L' },
  { id: 'weakness-right',   short: 'Weak R' },
  { id: 'balance',          short: 'Balance' },
  { id: 'speech-diff',      short: 'Speech' },
  { id: 'brain-fog',        short: 'Fog' },
  { id: 'tinnitus',         short: 'Ringing' },
  { id: 'tremors',          short: 'Tremors' },
  { id: 'light-sensitive',  short: 'Light' },
  { id: 'sound-sensitive',  short: 'Sound' },
]

function severityColor(severity: number) {
  if (severity >= 4) return 'bg-dangerRed'
  if (severity >= 3) return 'bg-warningAmber'
  return 'bg-accentViolet'
}

export function AttackTimeline() {
  const { activeAttack } = useAppStore()
  if (!activeAttack) return null

  const checkIns = activeAttack.checkIns
  if (checkIns.length === 0) return null

  // Get all symptom IDs that appear in any check-in
  const allIds = new Set(checkIns.flatMap((c) => c.symptoms.map((s) => s.id)))
  const displaySymptoms = TIMELINE_SYMPTOMS.filter((t) => allIds.has(t.id))

  // Also include any unlisted symptoms
  const listedIds = new Set(TIMELINE_SYMPTOMS.map((t) => t.id))
  checkIns.forEach((c) =>
    c.symptoms.forEach((s) => {
      if (!listedIds.has(s.id)) {
        displaySymptoms.push({ id: s.id, short: s.id.replace(/-/g, ' ') })
        listedIds.add(s.id)
      }
    }),
  )

  if (displaySymptoms.length === 0) return null

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-textSecondary mb-3">Symptom timeline</h3>
      <div className="overflow-x-auto -mx-1 px-1">
        <div style={{ minWidth: Math.max(320, checkIns.length * 80) }}>
          {/* Header row — timestamps */}
          <div className="flex mb-2" style={{ paddingLeft: 64 }}>
            {checkIns.map((c) => (
              <div
                key={c.id}
                className="flex-1 text-center text-[9px] text-textMuted"
              >
                {format(parseISO(c.loggedAt), 'h:mm')}
              </div>
            ))}
          </div>

          {/* Symptom rows */}
          {displaySymptoms.map((sym) => (
            <div key={sym.id} className="flex items-center mb-1.5">
              {/* Label */}
              <div className="w-16 flex-shrink-0 text-[10px] text-textMuted truncate pr-1">
                {sym.short}
              </div>
              {/* Cells */}
              {checkIns.map((c) => {
                const entry = c.symptoms.find((s) => s.id === sym.id)
                return (
                  <div key={c.id} className="flex-1 px-0.5">
                    {entry ? (
                      <div
                        className={cn(
                          'h-5 rounded-sm',
                          severityColor(entry.severity),
                        )}
                        style={{ opacity: 0.3 + entry.severity * 0.14 }}
                        title={`Severity ${entry.severity}`}
                      />
                    ) : (
                      <div className="h-5 rounded-sm bg-surfaceHigh opacity-30" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Pain row */}
          <div className="flex items-center mt-2 pt-2 border-t border-border">
            <div className="w-16 flex-shrink-0 text-[10px] text-textMuted">Pain</div>
            {checkIns.map((c) => (
              <div key={c.id} className="flex-1 px-0.5 text-center text-[10px] font-bold text-textSecondary">
                {c.painLevel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
