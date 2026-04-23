import { S3Client, HeadBucketCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import path from 'path'
import type { CloudConfig } from '../../src/types'

export class CloudService {
  private client: S3Client
  private bucket: string
  private pathPrefix: string

  constructor(provider: 's3' | 'r2', config: CloudConfig) {
    const clientConfig: any = {
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      region: config.region || 'auto',
    }

    if (provider === 'r2' && config.endpoint) {
      clientConfig.endpoint = config.endpoint
      clientConfig.forcePathStyle = true
    }

    this.client = new S3Client(clientConfig)
    this.bucket = config.bucket
    this.pathPrefix = config.pathPrefix || ''
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
      return { success: true, message: `Connected to bucket "${this.bucket}"` }
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return { success: false, message: `Bucket "${this.bucket}" not found` }
      }
      if (err.$metadata?.httpStatusCode === 403) {
        return { success: false, message: 'Access denied. Check your credentials.' }
      }
      return { success: false, message: err.message || 'Connection failed' }
    }
  }

  async upload(
    filePath: string,
    key: string,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    const fileSize = fs.statSync(filePath).size
    const fullKey = this.pathPrefix
      ? `${this.pathPrefix.replace(/\/$/, '')}/${key}`
      : key

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: fullKey,
        Body: fs.createReadStream(filePath),
        ContentType: 'application/gzip',
      },
      partSize: 50 * 1024 * 1024, // 50MB parts
      leavePartsOnError: false,
    })

    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded && fileSize > 0) {
        onProgress?.(Math.round((progress.loaded / fileSize) * 100))
      }
    })

    await upload.done()
  }

  getKey(owner: string, repoName: string): string {
    return `${owner}/${repoName}.tar.gz`
  }
}
