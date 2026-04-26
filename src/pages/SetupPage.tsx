import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import TokenInput from '../components/TokenInput'
import BackupFolderPicker from '../components/BackupFolderPicker'
import CloudConfig from '../components/CloudConfig'
import SupabaseAuthConfig from '../components/SupabaseAuthConfig'

export default function SetupPage() {
  const { settings, updateSettings, loading } = useSettings()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  const isReady = settings.githubToken && settings.backupPath

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Setup</h2>
      <p className="text-sm text-gray-400 mb-8">
        Configure your GitHub account, backup location, and optional cloud storage.
      </p>

      <div className="space-y-4">
        <TokenInput
          token={settings.githubToken}
          onTokenChange={(token) => updateSettings({ githubToken: token })}
        />

        <BackupFolderPicker
          path={settings.backupPath}
          onPathChange={(backupPath) => updateSettings({ backupPath })}
        />

        <CloudConfig
          provider={settings.cloudProvider}
          config={settings.cloudConfig}
          onProviderChange={(cloudProvider) => updateSettings({ cloudProvider })}
          onConfigChange={(cloudConfig) => updateSettings({ cloudConfig })}
        />

        <SupabaseAuthConfig
          config={settings.supabaseAuth}
          onConfigChange={(supabaseAuth) => updateSettings({ supabaseAuth })}
        />

        {isReady && (
          <div className="flex items-center justify-between p-4 bg-green-500/8 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/15 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-400">Setup complete!</p>
                <p className="text-xs text-gray-400">
                  Head to the <span className="text-gray-300">Repositories</span> tab to select repositories for backup.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/repos')}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold text-white transition-colors flex items-center gap-2"
            >
              Go to Repositories
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
