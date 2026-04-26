import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '../utils/constants'
import { SchedulerService } from '../services/scheduler.service'
import { BackupOrchestrator } from '../services/backup-orchestrator'
import { GitHubService } from '../services/github.service'
import { updateTrayMenu } from '../tray'
import store from '../store/store'
import type { AppSettings, ScheduleConfig } from '../../src/types'

const scheduler = new SchedulerService()

export function registerSchedulerHandlers(mainWindow: BrowserWindow) {
  // Set up the trigger to run a backup
  scheduler.setTrigger(async () => {
    const settings: AppSettings = {
      githubToken: store.get('githubToken'),
      backupPath: store.get('backupPath'),
      cloudProvider: store.get('cloudProvider'),
      cloudConfig: store.get('cloudConfig'),
      supabaseAuth: store.get('supabaseAuth'),
      repoFilters: store.get('repoFilters'),
      selectedRepoIds: store.get('selectedRepoIds'),
      schedule: store.get('schedule'),
      concurrencyLimit: store.get('concurrencyLimit'),
    }

    if (!settings.githubToken || !settings.backupPath) return

    try {
      const github = new GitHubService(settings.githubToken)
      let repos = await github.fetchRepos(settings.repoFilters)

      if (settings.selectedRepoIds.length > 0) {
        const selectedSet = new Set(settings.selectedRepoIds)
        repos = repos.filter((r) => selectedSet.has(r.id))
      }

      if (repos.length === 0) return

      const orchestrator = new BackupOrchestrator()

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
      })

      await orchestrator.run(repos, settings)
    } catch (err) {
      console.error('Scheduled backup failed:', err)
    }
  })

  // Start scheduler with current config
  const currentSchedule = store.get('schedule')
  if (currentSchedule.enabled) {
    scheduler.start(currentSchedule)
    updateTrayMenu(mainWindow, scheduler.getNextRun(currentSchedule) || undefined)
  }

  ipcMain.handle(IPC.SCHEDULE_GET, () => {
    return store.get('schedule')
  })

  ipcMain.handle(IPC.SCHEDULE_SET, (_event, schedule: ScheduleConfig) => {
    store.set('schedule', schedule)
    scheduler.start(schedule)
    updateTrayMenu(mainWindow, scheduler.getNextRun(schedule) || undefined)
    return true
  })
}
