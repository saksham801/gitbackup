# GitBackup

A desktop application to back up all your GitHub repositories locally and optionally to cloud storage (AWS S3 / Cloudflare R2).

![Electron](https://img.shields.io/badge/Electron-35-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **One-click GitHub backup** — Enter your Personal Access Token and back up all repositories with full code and branches
- **Smart incremental updates** — First run clones everything; subsequent runs only fetch changes
- **Flexible repo selection** — Filter by owned, organization, starred, forked, or collaborator repositories
- **Cloud storage support** — Upload compressed `.tar.gz` archives to AWS S3 or Cloudflare R2
- **Scheduled backups** — Set daily, weekly, or monthly automatic backups with system tray support
- **Rate limit aware** — Handles GitHub API pagination and rate limits for accounts with 200-300+ repos
- **Concurrent processing** — Configurable parallelism (1-10 repos at a time) for faster backups
- **Real-time progress** — Detailed per-repo status tracking with live log viewer
- **Secure** — Token stored encrypted locally, cleaned from git remote URLs after operations

## Screenshots

### Setup
Configure your GitHub token, backup folder, and optional cloud storage with a guided setup flow.

### Repositories
Browse and select repositories with filters for owned, org, starred, forked, and collaborator repos.

### Backup
Monitor real-time progress with per-repo status, progress bars, and a detailed log viewer.

## Download

Download the latest version for your platform from the [Releases](https://github.com/hiteshchoudhary/gitbackup/releases/latest) page.

| Platform | File | Notes |
|----------|------|-------|
| **macOS** | `GitBackup-x.x.x.dmg` | Open the `.dmg` and drag GitBackup to Applications. On first launch, right-click → Open to bypass Gatekeeper. |
| **Windows** | `GitBackup-Setup-x.x.x.exe` | Run the installer. Windows Defender may show a warning — click "More info" → "Run anyway". |
| **Linux** | `GitBackup-x.x.x.AppImage` | Make it executable: `chmod +x GitBackup-*.AppImage` then run it. |

> **Prerequisite:** [Git](https://git-scm.com/) must be installed on your system. GitBackup uses it to clone and update repositories.

### Creating a GitHub Token

You'll need a Personal Access Token to connect your account:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Personal access tokens** → **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Select scopes: `repo` (full access) and `read:org` (for org repos)
5. Click **Generate token** and paste it into the app

Fine-grained tokens also work — grant **Repository access → All repositories**.

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Git](https://git-scm.com/) installed and available in PATH

### Installation

```bash
git clone https://github.com/hiteshchoudhary/gitbackup.git
cd gitbackup
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite dev server with hot reload and launches the Electron app.

### Build & Package

```bash
# Build for current platform
npm run package

# Platform-specific builds
npm run package:mac
npm run package:win
npm run package:linux
```

Packaged apps are output to the `release/` directory.

## How It Works

1. **Authenticate** — Paste your GitHub PAT. The app validates it and fetches your account info.
2. **Select repos** — Choose filters (owned, org, starred, etc.) and fetch your repository list. Select which repos to back up.
3. **Choose backup folder** — Pick a local directory. Repos are cloned as `owner/repo-name/` with all branches.
4. **Configure cloud (optional)** — Add AWS S3 or Cloudflare R2 credentials. Each repo is archived as an individual `.tar.gz` and uploaded.
5. **Run backup** — Click Start. The app clones new repos and fetches updates for existing ones, compresses archives, and uploads to cloud — all with configurable concurrency.
6. **Schedule (optional)** — Set up daily/weekly/monthly automatic backups. The app runs in the system tray.

## Project Structure

```
gitbackup/
├── electron/                    # Main process (Node.js)
│   ├── main.ts                  # App window, tray, lifecycle
│   ├── preload.ts               # Secure IPC bridge
│   ├── tray.ts                  # System tray
│   ├── ipc/                     # IPC handlers
│   ├── services/
│   │   ├── github.service.ts    # GitHub API (Octokit)
│   │   ├── git.service.ts       # Clone & update repos
│   │   ├── compress.service.ts  # tar.gz archiving
│   │   ├── cloud.service.ts     # S3/R2 uploads
│   │   ├── backup-orchestrator.ts  # Core backup pipeline
│   │   └── scheduler.service.ts    # Cron scheduling
│   └── store/store.ts           # Encrypted settings
├── src/                         # Renderer process (React)
│   ├── pages/                   # Setup, Repos, Backup, Settings
│   ├── components/              # UI components
│   └── hooks/                   # IPC & state hooks
└── resources/                   # App icons
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 35 |
| Frontend | React 19 + Tailwind CSS |
| Language | TypeScript 5 |
| Bundler | Vite 8 |
| GitHub API | @octokit/rest |
| Git | simple-git |
| Cloud | AWS SDK v3 (S3-compatible, works with R2) |
| Storage | electron-store (encrypted) |
| Scheduling | node-cron |
| Packaging | electron-builder |

## Configuration

All settings are persisted locally in encrypted storage. No data is sent to any third-party service other than GitHub API and your configured cloud storage.

| Setting | Description |
|---------|-------------|
| GitHub Token | PAT with `repo` + `read:org` scopes |
| Backup Path | Local directory for cloned repos |
| Cloud Provider | None, AWS S3, or Cloudflare R2 |
| Schedule | Daily / Weekly / Monthly + time |
| Concurrency | 1-10 parallel repo operations |

## License

MIT

---

A [chaicode.com](https://chaicode.com) product
