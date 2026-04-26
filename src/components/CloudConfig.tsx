import { useState } from 'react'
import { ipcInvoke } from '../hooks/useIpc'
import type { CloudConfig as CloudConfigType } from '../types'

interface Props {
  provider: 's3' | 'r2' | 'supabase' | 'none'
  config: CloudConfigType
  onProviderChange: (provider: 's3' | 'r2' | 'supabase' | 'none') => void
  onConfigChange: (config: CloudConfigType) => void
}

const providers = [
  {
    id: 'none' as const,
    name: 'None',
    desc: 'No cloud storage',
    icon: (
      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    id: 's3' as const,
    name: 'AWS S3',
    desc: 'Amazon S3 bucket',
    icon: (
      <span className="text-[11px] font-bold text-orange-400 leading-none">aws</span>
    ),
  },
  {
    id: 'r2' as const,
    name: 'Cloudflare R2',
    desc: 'Cloudflare R2 storage',
    icon: (
      <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.066 19.984h-9.98c-.055 0-.107-.022-.146-.06a.209.209 0 01-.06-.146c0-.054.021-.107.06-.146a.207.207 0 01.146-.06h9.98c.055 0 .107.021.146.06.039.039.061.092.061.146s-.022.107-.06.146a.207.207 0 01-.147.06zM19.5 12c0 4.142-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5s7.5 3.358 7.5 7.5z" />
      </svg>
    ),
  },
  {
    id: 'supabase' as const,
    name: 'Supabase',
    desc: 'Supabase S3-compatible storage',
    icon: (
      <span className="text-[11px] font-bold text-sky-400 leading-none">sb</span>
    ),
  },
]

export default function CloudConfig({
  provider,
  config,
  onProviderChange,
  onConfigChange,
}: Props) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const updateField = (field: keyof CloudConfigType, value: string) => {
    onConfigChange({ ...config, [field]: value })
    setTestResult(null)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await ipcInvoke<{ success: boolean; message: string }>(
        'cloud:test-connection',
        provider,
        config,
      )
      setTestResult(result)
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">Cloud Storage (Optional)</h3>
          <p className="text-xs text-gray-500">Store backups in the cloud for extra protection.</p>
        </div>
      </div>

      {/* Provider selection - radio cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              onProviderChange(p.id)
              setTestResult(null)
            }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
              provider === p.id
                ? 'border-orange-500/60 bg-orange-500/5'
                : 'border-gray-800 bg-[#0a0e14] hover:border-gray-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              provider === p.id ? 'border-orange-500' : 'border-gray-600'
            }`}>
              {provider === p.id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              {p.icon}
              <div>
                <p className="text-xs font-semibold text-gray-200">{p.name}</p>
                <p className="text-[10px] text-gray-500">{p.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Config fields */}
      {provider !== 'none' && (
        <div className="space-y-3 p-4 bg-[#0a0e14] rounded-lg border border-gray-800/60">
          {provider === 'r2' && (
            <InputField
              label="R2 Endpoint URL"
              value={config.endpoint || ''}
              onChange={(v) => updateField('endpoint', v)}
              placeholder="https://<account-id>.r2.cloudflarestorage.com"
            />
          )}

          {(provider === 's3' || provider === 'r2') && (
            <InputField
              label={provider === 's3' ? 'Region' : 'R2 Endpoint URL'}
              value={provider === 's3' ? config.region || '' : config.endpoint || ''}
              onChange={(v) => updateField(provider === 's3' ? 'region' : 'endpoint', v)}
              placeholder={provider === 's3' ? 'us-east-1' : 'https://<account-id>.r2.cloudflarestorage.com'}
            />
          )}

          {provider === 'supabase' && (
            <>
              <InputField
                label="Supabase Project URL"
                value={config.projectUrl || ''}
                onChange={(v) => updateField('projectUrl', v)}
                placeholder="https://xyzcompany.supabase.co"
              />
              <InputField
                label="Supabase Anon Key"
                value={config.anonKey || ''}
                onChange={(v) => updateField('anonKey', v)}
                placeholder="public-anon-key"
                type="password"
              />
            </>
          )}

          <InputField
            label="Bucket Name"
            value={config.bucket}
            onChange={(v) => updateField('bucket', v)}
            placeholder="my-github-backups"
          />

          <InputField
            label="Access Key ID"
            value={config.accessKeyId || ''}
            onChange={(v) => updateField('accessKeyId', v)}
            placeholder="AKIA..."
          />

          <InputField
            label="Secret Access Key"
            value={config.secretAccessKey || ''}
            onChange={(v) => updateField('secretAccessKey', v)}
            placeholder=""
            type="password"
          />

          <InputField
            label="Path Prefix (optional)"
            value={config.pathPrefix || ''}
            onChange={(v) => updateField('pathPrefix', v)}
            placeholder="backups/"
          />

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={testConnection}
              disabled={testing || !config.bucket || (
                provider === 's3' && !config.accessKeyId) ||
                (provider === 's3' && !config.secretAccessKey) ||
                (provider === 'r2' && !config.accessKeyId) ||
                (provider === 'r2' && !config.secretAccessKey) ||
                (provider === 'supabase' && (!config.projectUrl || !config.anonKey))
              }
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-600 rounded-lg text-xs font-medium transition-colors text-gray-300"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {testResult && (
              <span className={`text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-[11px] text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#111820] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
      />
    </div>
  )
}
