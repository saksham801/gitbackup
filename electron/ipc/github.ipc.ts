import { ipcMain } from 'electron'
import { IPC } from '../utils/constants'
import { GitHubService } from '../services/github.service'

export function registerGitHubHandlers() {
  ipcMain.handle(IPC.GITHUB_VALIDATE_TOKEN, async (_event, token: string) => {
    const github = new GitHubService(token)
    return github.validateToken()
  })

  ipcMain.handle(IPC.GITHUB_FETCH_REPOS, async (_event, token: string, filters: any) => {
    const github = new GitHubService(token)
    return github.fetchRepos(filters)
  })
}
