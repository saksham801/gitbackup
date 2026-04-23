import { ipcMain } from 'electron'
import { IPC } from '../utils/constants'
import { CloudService } from '../services/cloud.service'
import type { CloudConfig } from '../../src/types'

export function registerCloudHandlers() {
  ipcMain.handle(
    IPC.CLOUD_TEST_CONNECTION,
    async (_event, provider: 's3' | 'r2', config: CloudConfig) => {
      try {
        const service = new CloudService(provider, config)
        return await service.testConnection()
      } catch (err: any) {
        return { success: false, message: err.message }
      }
    },
  )

  ipcMain.handle(
    IPC.CLOUD_UPLOAD,
    async (_event, provider: 's3' | 'r2', config: CloudConfig, filePath: string, key: string) => {
      try {
        const service = new CloudService(provider, config)
        await service.upload(filePath, key)
        return { success: true }
      } catch (err: any) {
        return { success: false, message: err.message }
      }
    },
  )
}
