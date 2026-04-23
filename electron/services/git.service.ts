import simpleGit from 'simple-git'
import fs from 'fs'
import path from 'path'

export class GitService {
  private sanitizeUrl(url: string, token: string): string {
    return url.replace('https://', `https://${token}@`)
  }

  repoExists(repoPath: string): boolean {
    try {
      return (
        fs.existsSync(repoPath) &&
        fs.existsSync(path.join(repoPath, '.git'))
      )
    } catch {
      return false
    }
  }

  async cloneRepo(
    cloneUrl: string,
    destPath: string,
    token: string,
    onProgress?: (stage: string) => void,
  ): Promise<void> {
    const parentDir = path.dirname(destPath)
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true })
    }

    const authUrl = this.sanitizeUrl(cloneUrl, token)
    const git = simpleGit()

    onProgress?.('cloning')

    // Full clone with all branches
    await git.clone(authUrl, destPath, ['--progress'])

    // Fetch all remote branches and check them out locally
    const repoGit = simpleGit(destPath)
    const branches = await repoGit.branch(['-r'])

    for (const branchPath of branches.all) {
      // Skip HEAD pointer
      if (branchPath.includes('HEAD')) continue
      // origin/main -> main
      const localName = branchPath.replace(/^origin\//, '')
      try {
        await repoGit.checkout(['-b', localName, branchPath])
      } catch {
        // Branch may already exist (e.g. main/master), skip
      }
    }

    // Return to default branch
    const defaultBranch = branches.all.find(
      (b) => b === 'origin/main' || b === 'origin/master',
    )
    if (defaultBranch) {
      await repoGit.checkout(defaultBranch.replace(/^origin\//, ''))
    }
  }

  async updateRepo(
    repoPath: string,
    token: string,
    cloneUrl: string,
    onProgress?: (stage: string) => void,
  ): Promise<void> {
    const git = simpleGit(repoPath)

    onProgress?.('updating')

    // Update the remote URL with current token (in case it changed)
    const authUrl = this.sanitizeUrl(cloneUrl, token)
    await git.remote(['set-url', 'origin', authUrl])

    // Fetch all branches
    await git.fetch(['--all', '--prune', '--progress'])

    // Get current branch
    const currentBranch = (await git.branch()).current

    // Pull current branch
    try {
      await git.pull('origin', currentBranch, ['--ff-only'])
    } catch {
      // ff-only may fail if diverged, that's ok for backup
    }

    // Check out any new remote branches
    const branches = await git.branch(['-r'])
    const localBranches = await git.branchLocal()

    for (const branchPath of branches.all) {
      if (branchPath.includes('HEAD')) continue
      const localName = branchPath.replace(/^origin\//, '')
      if (!localBranches.all.includes(localName)) {
        try {
          await git.checkout(['-b', localName, branchPath])
        } catch {
          // skip if fails
        }
      }
    }

    // Return to the branch we were on
    if (currentBranch) {
      await git.checkout(currentBranch)
    }

    // Clean the token from remote URL after operations
    const cleanUrl = cloneUrl
    await git.remote(['set-url', 'origin', cleanUrl])
  }

  async cloneOrUpdate(
    cloneUrl: string,
    repoPath: string,
    token: string,
    onProgress?: (stage: string) => void,
  ): Promise<'cloned' | 'updated'> {
    if (this.repoExists(repoPath)) {
      await this.updateRepo(repoPath, token, cloneUrl, onProgress)
      return 'updated'
    } else {
      await this.cloneRepo(cloneUrl, repoPath, token, onProgress)
      return 'cloned'
    }
  }
}
