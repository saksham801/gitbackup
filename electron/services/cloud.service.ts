import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import path from 'path'
import type { CloudConfig } from '../../src/types'

export class CloudService {
  private client: S3Client | null = null
  private bucket: string
  private pathPrefix: string
  private supabaseProjectUrl?: string
  private supabaseAnonKey?: string

  constructor(provider: 's3' | 'r2' | 'supabase', config: CloudConfig) {
    this.bucket = config.bucket
    this.pathPrefix = config.pathPrefix || ''

    if (provider === 'supabase') {
      if (!config.projectUrl || !config.anonKey) {
        throw new Error('Supabase project URL and anon key are required')
      }
      this.supabaseProjectUrl = config.projectUrl
      this.supabaseAnonKey = config.anonKey
      return
    }

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
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.supabaseProjectUrl && this.supabaseAnonKey) {
        const url = new URL(`/storage/v1/object/${encodeURIComponent(this.bucket)}`, this.supabaseProjectUrl)
        url.searchParams.set('limit', '1')
        url.searchParams.set('offset', '0')

        const response = await fetch(url.toString(), {
          headers: {
            apikey: this.supabaseAnonKey,
            Authorization: `Bearer ${this.supabaseAnonKey}`,
          },
        })

        if (!response.ok) {
          const result = await response.json().catch(() => null)
          throw new Error(result?.message || response.statusText || 'Supabase storage connection failed')
        }

        return { success: true, message: `Connected to Supabase bucket "${this.bucket}"` }
      }

      await this.client!.send(new HeadBucketCommand({ Bucket: this.bucket }))
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

    if (this.supabaseProjectUrl && this.supabaseAnonKey) {
      const uploadUrl = new URL(`/storage/v1/object/${encodeURIComponent(this.bucket)}`, this.supabaseProjectUrl)
      uploadUrl.searchParams.set('path', fullKey)
      uploadUrl.searchParams.set('upsert', 'true')

      const fileBuffer = fs.readFileSync(filePath)
      const formData = new FormData()
      formData.append('file', new Blob([fileBuffer]), path.basename(filePath))

      const response = await fetch(uploadUrl.toString(), {
        method: 'POST',
        headers: {
          apikey: this.supabaseAnonKey,
          Authorization: `Bearer ${this.supabaseAnonKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.message || response.statusText || 'Supabase upload failed')
      }

      onProgress?.(100)
      return
    }

    const upload = new Upload({
      client: this.client!,
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
