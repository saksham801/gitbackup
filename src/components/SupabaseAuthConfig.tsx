import type { SupabaseAuthConfig } from '../types'
import type { ChangeEvent } from 'react'

interface Props {
  config: SupabaseAuthConfig
  onConfigChange: (config: SupabaseAuthConfig) => void
}

export default function SupabaseAuthConfig({ config, onConfigChange }: Props) {
  const updateField = (field: keyof SupabaseAuthConfig, value: string | boolean) => {
    onConfigChange({ ...config, [field]: value } as SupabaseAuthConfig)
  }

  const onInputChange = (field: keyof SupabaseAuthConfig) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(field, event.target.type === 'checkbox' ? event.target.checked : event.target.value)
  }

  return (
    <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5zm0 11.25a6.75 6.75 0 01-5.657-2.97.75.75 0 111.191-.92A5.25 5.25 0 0012 17.25a5.25 5.25 0 004.466-2.39.75.75 0 111.191.92A6.75 6.75 0 0112 17.25z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">Supabase Auth</h3>
          <p className="text-xs text-gray-500">Enable login for a single authorized Supabase user.</p>
        </div>
      </div>

      <div className="space-y-3 p-4 bg-[#0a0e14] rounded-lg border border-gray-800/60">
        <label className="flex items-center gap-3 text-sm text-gray-300 mb-2">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={onInputChange('enabled')}
            className="accent-orange-500"
          />
          Require Supabase login
        </label>

        <div>
          <label className="block text-[11px] text-gray-400 mb-1">Project URL</label>
          <input
            type="url"
            value={config.projectUrl}
            onChange={onInputChange('projectUrl')}
            placeholder="https://xyzcompany.supabase.co"
            className="w-full bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label className="block text-[11px] text-gray-400 mb-1">Anon Key</label>
          <input
            type="password"
            value={config.anonKey}
            onChange={onInputChange('anonKey')}
            placeholder="public-anon-key"
            className="w-full bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label className="block text-[11px] text-gray-400 mb-1">Allowed user email</label>
          <input
            type="email"
            value={config.allowedEmail}
            onChange={onInputChange('allowedEmail')}
            placeholder="user@example.com"
            className="w-full bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          />
        </div>
      </div>
    </div>
  )
}
