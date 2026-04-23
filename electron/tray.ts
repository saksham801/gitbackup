import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow) {
  // Create a simple 16x16 tray icon
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('GitBackup')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open GitBackup',
      click: () => mainWindow.show(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        ;(app as any).isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow.show()
  })
}

export function updateTrayMenu(mainWindow: BrowserWindow, nextRun?: string) {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open GitBackup',
      click: () => mainWindow.show(),
    },
    ...(nextRun
      ? [{ label: `Next backup: ${nextRun}`, enabled: false } as Electron.MenuItemConstructorOptions]
      : []),
    { type: 'separator' as const },
    {
      label: 'Quit',
      click: () => {
        ;(app as any).isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
}
