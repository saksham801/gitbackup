import { ipcMain } from 'electron'
import { IPC } from '../utils/constants'
import { GitService } from '../services/git.service'

const gitService = new GitService()

export function registerGitHandlers() {
  ipcMain.handle(
    IPC.GIT_CLONE,
    async (_event, cloneUrl: string, destPath: string, token: string) => {
      try {
        const result = await gitService.cloneOrUpdate(cloneUrl, destPath, token)
        return { success: true, action: result }
      } catch (err: any) {
        return { success: false, message: err.message }
      }
    },
  )

  ipcMain.handle(IPC.GIT_PULL, async (_event, repoPath: string, token: string, cloneUrl: string) => {
    try {
      await gitService.updateRepo(repoPath, token, cloneUrl)
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })
}
