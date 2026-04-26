import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'

export default function LoginPage() {
  const { login, authReady, authRequired, user } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authReady) return
    if (!authRequired) {
      navigate('/setup', { replace: true })
    } else if (user) {
      navigate('/setup', { replace: true })
    }
  }, [authReady, authRequired, user, navigate])

  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Checking authentication...</div>
      </div>
    )
  }

  if (!authRequired || user) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/setup')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const missingConfig = !settings.supabaseAuth.projectUrl || !settings.supabaseAuth.anonKey

  return (
    <div className="max-w-md mx-auto pt-16">
      <div className="p-8 bg-[#111820] border border-gray-800 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Supabase Login</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your Supabase email and password to access GitBackup.
        </p>

        {missingConfig ? (
          <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-200 mb-6">
            Supabase auth is enabled, but the project details are not configured.
            Please open Setup and add your Supabase URL and anon key.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs text-gray-400 uppercase tracking-[0.2em]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-800 bg-[#0b1018] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20"
            disabled={loading || missingConfig}
          />

          <label className="block text-xs text-gray-400 uppercase tracking-[0.2em]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-800 bg-[#0b1018] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20"
            disabled={loading || missingConfig}
          />

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || missingConfig || !email || !password}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
