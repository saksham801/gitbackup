import { BrowserWindow } from 'electron'
import { registerSettingsHandlers } from './settings.ipc'
import { registerGitHubHandlers } from './github.ipc'
import { registerGitHandlers } from './git.ipc'
import { registerCloudHandlers } from './cloud.ipc'
import { registerBackupHandlers } from './backup.ipc'
import { registerSchedulerHandlers } from './scheduler.ipc'

export function registerAllHandlers(mainWindow: BrowserWindow) {
  registerSettingsHandlers()
  registerGitHubHandlers()
  registerGitHandlers()
  registerCloudHandlers()
  registerBackupHandlers(mainWindow)
  registerSchedulerHandlers(mainWindow)
}
