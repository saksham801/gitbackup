import { useState, useCallback } from 'react'
import { useSettings } from '../hooks/useSettings'
import { ipcInvoke } from '../hooks/useIpc'
import RepoFilters from '../components/RepoFilters'
import RepoList from '../components/RepoList'
import type { RepoInfo, RepoFilterSet } from '../types'

export default function ReposPage() {
  const { settings, updateSettings, loading } = useSettings()
  const [repos, setRepos] = useState<RepoInfo[]>([])
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchRepos = useCallback(async () => {
    if (!settings.githubToken) {
      setFetchError('Please set your GitHub token in Setup first.')
      return
    }
    setFetching(true)
    setFetchError(null)
    try {
      const result = await ipcInvoke<RepoInfo[]>(
        'github:fetch-repos',
        settings.githubToken,
        settings.repoFilters,
      )
      setRepos(result)
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch repositories')
    } finally {
      setFetching(false)
    }
  }, [settings.githubToken, settings.repoFilters])

  const handleFilterChange = async (filters: RepoFilterSet) => {
    await updateSettings({ repoFilters: filters })
  }

  const handleSelectionChange = async (ids: number[]) => {
    await updateSettings({ selectedRepoIds: ids })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-1">Repositories</h2>
      <p className="text-sm text-gray-400 mb-8">
        Select filters and fetch your repositories from GitHub.
      </p>

      <div className="space-y-4">
        {/* Filters card */}
        <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100">Repository Filters</h3>
              <p className="text-xs text-gray-500">Choose which types of repositories to include.</p>
            </div>
          </div>

          <RepoFilters
            filters={settings.repoFilters}
            onFilterChange={handleFilterChange}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={fetchRepos}
              disabled={fetching || !settings.githubToken}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm font-semibold transition-colors text-white"
            >
              {fetching ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching...
                </span>
              ) : (
                'Fetch Repositories'
              )}
            </button>

            {!settings.githubToken && (
              <span className="text-xs text-yellow-500">Set your token in Setup first</span>
            )}
          </div>

          {fetchError && (
            <div className="mt-3 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              {fetchError}
            </div>
          )}
        </div>

        {/* Repo list card */}
        {repos.length > 0 && (
          <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-100">Select Repositories</h3>
                <p className="text-xs text-gray-500">Choose which repositories to include in your backup.</p>
              </div>
            </div>

            <RepoList
              repos={repos}
              selectedIds={settings.selectedRepoIds}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
