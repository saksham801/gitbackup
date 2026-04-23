import { ipcMain, dialog } from 'electron'
import { IPC } from '../utils/constants'
import store from '../store/store'

export function registerSettingsHandlers() {
  ipcMain.handle(IPC.SETTINGS_GET, () => {
    return {
      githubToken: store.get('githubToken'),
      backupPath: store.get('backupPath'),
      cloudProvider: store.get('cloudProvider'),
      cloudConfig: store.get('cloudConfig'),
      repoFilters: store.get('repoFilters'),
      selectedRepoIds: store.get('selectedRepoIds'),
      schedule: store.get('schedule'),
      concurrencyLimit: store.get('concurrencyLimit'),
    }
  })

  ipcMain.handle(IPC.SETTINGS_SET, (_event, settings: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key, value)
    }
    return true
  })

  ipcMain.handle(IPC.DIALOG_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Backup Folder',
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })
}
