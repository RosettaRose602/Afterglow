import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { user, setUser } = useAppStore()
  const [name, setName] = useState(user?.name ?? '')
  const [hydrationTarget, setHydrationTarget] = useState(user?.preferences.hydrationTarget ?? 2000)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setUser({
      id: user?.id ?? crypto.randomUUID(),
      name: name || 'Friend',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      migraineProfile: user?.migraineProfile ?? {
        knownTriggers: [],
        preventiveMeds: [],
        abortiveMeds: [],
        erThreshold: 8,
      },
      preferences: {
        reducedMotion: false,
        fontSize: 'normal',
        notifications: true,
        theme: 'dark',
        hydrationTarget,
        hydrationUnit: 'ml',
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-full">
      <header className="page-header">
        <h1 className="text-2xl font-bold text-textPrimary">Settings</h1>
      </header>

      <div className="px-4 pb-6 space-y-4">
        {/* Profile */}
        <div className="card p-4 space-y-4">
          <h3 className="section-title">Profile</h3>
          <div>
            <label className="label-base">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should I call you?"
              className="input-base"
            />
          </div>
        </div>

        {/* Hydration */}
        <div className="card p-4 space-y-4">
          <h3 className="section-title">Hydration Goal</h3>
          <div>
            <label className="label-base">Daily target (ml)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1000}
                max={4000}
                step={100}
                value={hydrationTarget}
                onChange={(e) => setHydrationTarget(Number(e.target.value))}
                className="flex-1 accent-accentIce"
              />
              <span className="text-sm font-bold text-accentIce w-16 text-right">{hydrationTarget}ml</span>
            </div>
            <p className="text-xs text-textMuted mt-1">Recommended: 2000–3000ml per day</p>
          </div>
        </div>

        {/* App info */}
        <div className="card p-4 space-y-2">
          <h3 className="section-title">About Afterglow</h3>
          <p className="text-sm text-textMuted">Version 0.1.0</p>
          <p className="text-sm text-textMuted">
            Built with ♥ for migraine warriors. All data is stored locally on your device.
          </p>
          <p className="text-xs text-textMuted mt-2">
            Afterglow is not a medical device and does not provide medical advice. Always consult your healthcare provider.
          </p>
        </div>

        {/* ER reminder */}
        <div className="card p-4 border-dangerRed/20">
          <h3 className="text-sm font-semibold text-dangerRed mb-2">🆘 Emergency reminders</h3>
          <ul className="text-xs text-textMuted space-y-1 list-disc list-inside">
            <li>Sudden worst headache of your life</li>
            <li>Headache with fever and stiff neck</li>
            <li>Sudden vision loss or double vision</li>
            <li>New weakness, numbness, or speech problems</li>
            <li>Headache after head injury</li>
          </ul>
          <p className="text-xs text-dangerRed mt-2 font-medium">If any of these occur, seek emergency care immediately.</p>
        </div>

        <button
          onClick={handleSave}
          className={cn('btn-primary w-full', saved && 'bg-safeGreen')}
        >
          {saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}
