import { useRef, useEffect } from 'react'
import { ipcInvoke } from '../hooks/useIpc'
import { useBackupProgress } from '../hooks/useBackupProgress'
import type { RepoBackupStage } from '../types'

const stageLabels: Record<RepoBackupStage, string> = {
  pending: 'Pending',
  cloning: 'Cloning',
  updating: 'Updating',
  compressing: 'Compressing',
  uploading: 'Uploading',
  done: 'Done',
  failed: 'Failed',
  skipped: 'Skipped',
}

const stageColors: Record<RepoBackupStage, string> = {
  pending: 'text-gray-500',
  cloning: 'text-blue-400',
  updating: 'text-blue-400',
  compressing: 'text-yellow-400',
  uploading: 'text-purple-400',
  done: 'text-green-400',
  failed: 'text-red-400',
  skipped: 'text-gray-500',
}

export default function BackupPage() {
  const { statuses, logs, summary, running, start, reset, setRunning } =
    useBackupProgress()
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleStart = async () => {
    start()
    const result = await ipcInvoke<{
      success: boolean
      message?: string
      totalRepos?: number
    }>('backup:start')
    if (!result.success) {
      setRunning(false)
      alert(result.message || 'Failed to start backup')
    }
  }

  const handleCancel = async () => {
    await ipcInvoke('backup:cancel')
  }

  const completed = statuses.filter(
    (s) => s.stage === 'done' || s.stage === 'failed' || s.stage === 'skipped',
  ).length
  const total = statuses.length || 1
  const overallPercent = Math.round((completed / total) * 100)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Backup</h2>
          <p className="text-sm text-gray-400 mt-1">
            Run and monitor your backup progress.
          </p>
        </div>
        <div className="flex gap-2">
          {!running && (
            <button
              onClick={handleStart}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold transition-colors text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Start Backup
            </button>
          )}
          {running && (
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm font-semibold transition-colors text-red-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
              Cancel
            </button>
          )}
          {summary && !running && (
            <button
              onClick={reset}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors text-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary card */}
      {summary && (
        <div className="mb-4 p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500/15 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-100">Backup Complete</h3>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <Stat value={summary.totalRepos} label="Total" color="text-gray-100" />
            <Stat value={summary.succeeded} label="Succeeded" color="text-green-400" />
            <Stat value={summary.failed} label="Failed" color="text-red-400" />
            <Stat value={summary.skipped} label="Skipped" color="text-gray-400" />
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            Duration: {(summary.duration / 1000).toFixed(1)}s
          </div>

          {summary.errors.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-xs font-medium text-red-400">Errors:</p>
              {summary.errors.map((e, i) => (
                <div key={i} className="text-xs text-red-300 bg-red-500/10 border border-red-500/10 px-3 py-2 rounded-lg">
                  <span className="font-medium">{e.repoName}:</span> {e.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {running && statuses.length > 0 && (
        <div className="mb-4 p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{completed} of {statuses.length} repositories</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="h-2 bg-[#0a0e14] rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Repo status list */}
      {statuses.length > 0 && (
        <div className="mb-4 p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <h3 className="text-sm font-semibold text-gray-100 mb-3">Repository Status</h3>
          <div className="border border-gray-800 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-800/50">
            {statuses
              .sort((a, b) => {
                const order: Record<RepoBackupStage, number> = {
                  cloning: 0, updating: 0, compressing: 1, uploading: 1,
                  pending: 2, done: 3, failed: 3, skipped: 4,
                }
                return (order[a.stage] ?? 9) - (order[b.stage] ?? 9)
              })
              .map((s) => (
                <div key={s.repoId} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-medium w-24 ${stageColors[s.stage]}`}>
                      {stageLabels[s.stage]}
                    </span>
                    <span className="text-sm text-gray-300 truncate">{s.repoName}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {s.stage !== 'done' && s.stage !== 'failed' && s.stage !== 'skipped' && s.stage !== 'pending' && (
                      <div className="w-20 h-1.5 bg-[#0a0e14] rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                      </div>
                    )}
                    {s.error && (
                      <span className="text-xs text-red-400 truncate max-w-40" title={s.error}>{s.error}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Log viewer */}
      {logs.length > 0 && (
        <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <h3 className="text-sm font-semibold text-gray-100 mb-3">Log</h3>
          <div className="bg-[#0a0e14] border border-gray-800 rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-xs">
            {logs.map((entry, i) => (
              <div key={i} className="flex gap-2 py-0.5">
                <span className="text-gray-600 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className={
                  entry.level === 'error' ? 'text-red-400' :
                  entry.level === 'warn' ? 'text-yellow-400' : 'text-gray-400'
                }>
                  {entry.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!running && !summary && statuses.length === 0 && (
        <div className="p-12 bg-[#111820] rounded-xl border border-gray-800/80 text-center">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <p className="text-sm text-gray-300 font-medium">No backup running</p>
          <p className="text-xs text-gray-500 mt-1">
            Click <span className="text-orange-400 font-medium">Start Backup</span> to begin backing up your selected repositories.
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="p-3 bg-[#0a0e14] rounded-lg">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
