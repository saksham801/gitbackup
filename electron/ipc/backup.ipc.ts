import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '../utils/constants'
import { BackupOrchestrator } from '../services/backup-orchestrator'
import { GitHubService } from '../services/github.service'
import store from '../store/store'
import type { AppSettings, RepoInfo } from '../../src/types'

let activeOrchestrator: BackupOrchestrator | null = null

export function registerBackupHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(IPC.BACKUP_START, async () => {
    if (activeOrchestrator) {
      return { success: false, message: 'Backup already in progress' }
    }

    try {
      const settings: AppSettings = {
        githubToken: store.get('githubToken'),
        backupPath: store.get('backupPath'),
        cloudProvider: store.get('cloudProvider'),
        cloudConfig: store.get('cloudConfig'),
        repoFilters: store.get('repoFilters'),
        selectedRepoIds: store.get('selectedRepoIds'),
        schedule: store.get('schedule'),
        concurrencyLimit: store.get('concurrencyLimit'),
      }

      if (!settings.githubToken || !settings.backupPath) {
        return {
          success: false,
          message: 'Please configure GitHub token and backup path in Setup',
        }
      }

      // Fetch repos
      const github = new GitHubService(settings.githubToken)
      let repos = await github.fetchRepos(settings.repoFilters)

      // Filter to selected repos if any are selected
      if (settings.selectedRepoIds.length > 0) {
        const selectedSet = new Set(settings.selectedRepoIds)
        repos = repos.filter((r) => selectedSet.has(r.id))
      }

      if (repos.length === 0) {
        return { success: false, message: 'No repositories to back up' }
      }

      // Create orchestrator and wire events
      const orchestrator = new BackupOrchestrator()
      activeOrchestrator = orchestrator

      orchestrator.on('progress', (status) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC.BACKUP_PROGRESS, status)
        }
      })

      orchestrator.on('log', (entry) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC.BACKUP_LOG, entry)
        }
      })

      orchestrator.on('complete', (summary) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC.BACKUP_COMPLETE, summary)
        }
        activeOrchestrator = null
      })

      // Run in background (don't await — return immediately)
      orchestrator.run(repos, settings).catch((err) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send(IPC.BACKUP_COMPLETE, {
            totalRepos: repos.length,
            succeeded: 0,
            failed: repos.length,
            skipped: 0,
            duration: 0,
            errors: [{ repoName: 'system', error: err.message }],
          })
        }
        activeOrchestrator = null
      })

      return { success: true, totalRepos: repos.length }
    } catch (err: any) {
      activeOrchestrator = null
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle(IPC.BACKUP_CANCEL, async () => {
    if (activeOrchestrator) {
      activeOrchestrator.cancel()
      activeOrchestrator = null
      return { success: true }
    }
    return { success: false, message: 'No backup in progress' }
  })
}
