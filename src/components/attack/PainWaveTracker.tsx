import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import type { WaveEntry } from '@/types'

const PAIN_COLORS = ['', '#4caf8a','#6ab870','#90b850','#c0a840','#e0943a','#e07030','#d85020','#c83020','#b82020','#e05a5a']

interface Props {
  attackId: string
}

export function PainWaveTracker({ attackId }: Props) {
  const { activeAttack, addWaveEntry } = useAppStore()
  const [selected, setSelected] = useState<number | null>(null)
  const [logged, setLogged] = useState(false)

  const waveLog = activeAttack?.waveLog ?? []

  function handleLog() {
    if (selected === null) return
    const entry: WaveEntry = {
      id: crypto.randomUUID(),
      attackId,
      loggedAt: new Date().toISOString(),
      pain: selected,
    }
    addWaveEntry(entry)
    setLogged(true)
    setTimeout(() => setLogged(false), 1500)
  }

  const chartData = waveLog.map((e) => ({
    time: format(parseISO(e.loggedAt), 'h:mm a'),
    pain: e.pain,
  }))

  return (
    <div className="card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-textSecondary">Pain level</h3>

      {/* Pain number picker */}
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={cn(
              'py-3 rounded-xl border text-sm font-bold transition-all min-h-[48px]',
              selected === n
                ? 'border-transparent text-white'
                : 'border-border bg-surfaceHigh text-textSecondary hover:text-textPrimary',
            )}
            style={selected === n ? { backgroundColor: PAIN_COLORS[n] } : undefined}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        onClick={handleLog}
        disabled={selected === null}
        className={cn(
          'w-full py-3 rounded-xl text-sm font-semibold transition-all',
          logged
            ? 'bg-safeGreen/15 text-safeGreen border border-safeGreen/30'
            : selected !== null
            ? 'bg-accentViolet/15 text-accentViolet border border-accentViolet/30 hover:bg-accentViolet/25'
            : 'bg-surfaceHigh text-textMuted border border-border opacity-50 cursor-not-allowed',
        )}
      >
        {logged ? '✓ Logged' : 'Log pain level'}
      </button>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div>
          <p className="text-xs text-textMuted mb-2">Pain over time</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: '#64748b' }} width={18} />
              <Tooltip
                contentStyle={{ background: '#12122a', border: '1px solid #1e1e3a', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <ReferenceLine y={7} stroke="#ef444455" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="pain"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ r: 3, fill: '#7c3aed' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
