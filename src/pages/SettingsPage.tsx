import { useSettings } from '../hooks/useSettings'
import type { ScheduleConfig } from '../types'

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const schedule = settings.schedule
  const updateSchedule = (partial: Partial<ScheduleConfig>) => {
    updateSettings({ schedule: { ...schedule, ...partial } })
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Settings</h2>
      <p className="text-sm text-gray-400 mb-8">Configure backup schedule and preferences.</p>

      <div className="space-y-4">
        {/* Schedule card */}
        <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-100">Scheduled Backups</h3>
                <p className="text-xs text-gray-500">Automatically run backups on a schedule.</p>
              </div>
            </div>

            <button
              onClick={() => updateSchedule({ enabled: !schedule.enabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                schedule.enabled ? 'bg-orange-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  schedule.enabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {schedule.enabled && (
            <div className="space-y-4 p-4 bg-[#0a0e14] rounded-lg border border-gray-800/60">
              <div>
                <label className="block text-[11px] text-gray-400 mb-2">Frequency</label>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateSchedule({ frequency: f })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                        schedule.frequency === f
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          : 'bg-[#111820] text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Time</label>
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => updateSchedule({ time: e.target.value })}
                  className="bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {schedule.frequency === 'weekly' && (
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Day of Week</label>
                  <select
                    value={schedule.dayOfWeek ?? 0}
                    onChange={(e) => updateSchedule({ dayOfWeek: Number(e.target.value) })}
                    className="bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
                  >
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                      (day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ),
                    )}
                  </select>
                </div>
              )}

              {schedule.frequency === 'monthly' && (
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Day of Month</label>
                  <select
                    value={schedule.dayOfMonth ?? 1}
                    onChange={(e) => updateSchedule({ dayOfMonth: Number(e.target.value) })}
                    className="bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-orange-500/50"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Concurrency card */}
        <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100">Performance</h3>
              <p className="text-xs text-gray-500">Configure parallel processing for backups.</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-2">
              Concurrency Limit: <span className="text-orange-400 font-semibold">{settings.concurrencyLimit}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={settings.concurrencyLimit}
              onChange={(e) => updateSettings({ concurrencyLimit: Number(e.target.value) })}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>1 (slower, less resources)</span>
              <span>10 (faster, more resources)</span>
            </div>
          </div>
        </div>

        {/* About card */}
        <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/15 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.5 12 10.82 5.64 7.5 12 4.18zM5 8.82l6 3.33v7.03l-6-3.33V8.82zm8 10.36V12.15l6-3.33v7.03l-6 3.33z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100">GitBackup v1.0.0</h3>
              <p className="text-xs text-gray-500">
                Settings are stored locally and encrypted. Your token never leaves this machine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
