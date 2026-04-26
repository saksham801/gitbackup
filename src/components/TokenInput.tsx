import { useState } from 'react'
import { ipcInvoke } from '../hooks/useIpc'

interface TokenValidation {
  valid: boolean
  user?: string
  name?: string
  avatarUrl?: string
  profileUrl?: string
  publicRepos?: number
  privateRepos?: number
  scopes?: string[]
  error?: string
}

interface Props {
  token: string
  onTokenChange: (token: string) => void
}

export default function TokenInput({ token, onTokenChange }: Props) {
  const [validating, setValidating] = useState(false)
  const [status, setStatus] = useState<TokenValidation | null>(null)
  const [showToken, setShowToken] = useState(false)

  const validate = async () => {
    if (!token.trim()) return
    setValidating(true)
    setStatus(null)
    console.log('Validating token...')
    try {
      const result = await ipcInvoke<TokenValidation>(
        'github:validate-token',
        token,
      )
      console.log('Validation result:', result)
      setStatus(result)
    } catch (error) {
      console.error('Validation error:', error)
      setStatus({ valid: false, error: 'Failed to validate token' })
    } finally {
      setValidating(false)
    }
  }

  const disconnect = () => {
    onTokenChange('')
    setStatus(null)
  }

  return (
    <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">GitHub Account</h3>
          <p className="text-xs text-gray-500">Connect your GitHub account using a Personal Access Token.</p>
        </div>
      </div>

      {/* Token input */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => {
              onTokenChange(e.target.value)
              setStatus(null)
            }}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-[#0a0e14] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {showToken ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              )}
            </svg>
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          onClick={validate}
          disabled={validating || !token.trim()}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm font-semibold transition-colors text-white"
        >
          {validating ? 'Connecting...' : 'Connect'}
        </button>
      </div>

      {/* Connected state */}
      {status?.valid && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400">Connected as</span>
          <img
            src={status.avatarUrl}
            alt={status.user}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-xs font-semibold text-gray-200">{status.user}</span>
          <button
            onClick={disconnect}
            className="text-xs text-orange-400 hover:text-orange-300 ml-1"
          >
            Log out
          </button>
        </div>
      )}

      {/* Error state */}
      {status && !status.valid && (
        <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
          {status.error}
        </div>
      )}

      {/* Token guide */}
      <div className="mt-4 p-4 bg-[#0a0e14] rounded-lg border border-gray-800/60">
        <p className="text-xs font-semibold text-gray-300 mb-4">How to create a Personal Access Token</p>

        <div className="flex items-start gap-0">
          {/* Step 1 */}
          <div className="flex-1 relative">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-gray-800 mx-2" />
            </div>
            <p className="text-[11px] font-semibold text-gray-300">1 &nbsp;Go to GitHub</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Open Developer settings</p>
            <p className="text-[10px] text-blue-400 mt-0.5">github.com/settings/developers</p>
          </div>

          {/* Step 2 */}
          <div className="flex-1 relative">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-gray-800 mx-2" />
            </div>
            <p className="text-[11px] font-semibold text-gray-300">2 &nbsp;Create Token</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Click Personal access tokens</p>
            <p className="text-[10px] text-gray-500">{'->'} Tokens (classic)</p>
          </div>

          {/* Step 3 */}
          <div className="flex-1 relative">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-gray-800 mx-2" />
            </div>
            <p className="text-[11px] font-semibold text-gray-300">3 &nbsp;Select Scopes</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Select <code className="text-orange-400 bg-orange-500/10 px-1 rounded">repo</code> (full access)
            </p>
            <p className="text-[10px] text-gray-500">
              and <code className="text-orange-400 bg-orange-500/10 px-1 rounded">read:org</code> (for org repos)
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex-1 relative">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-gray-800 mx-2" />
            </div>
            <p className="text-[11px] font-semibold text-gray-300">4 &nbsp;Generate & Paste</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Click Generate token</p>
            <p className="text-[10px] text-gray-500">and paste it above</p>
          </div>

          {/* Done */}
          <div className="flex-shrink-0 pt-0">
            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[11px] font-semibold text-green-400">Done!</p>
            <p className="text-[10px] text-gray-500 mt-0.5">You're all set.</p>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 mt-4 pt-3 border-t border-gray-800/60">
          Fine-grained tokens also work — make sure to grant Repository access {'→'} All repositories.
        </p>
      </div>
    </div>
  )
}
