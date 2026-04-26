import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import fs from 'fs'
import type { CloudConfig } from '../../src/types'

export class CloudService {
  private client: S3Client | null = null
  private supabase: SupabaseClient | null = null
  private bucket: string
  private pathPrefix: string

  constructor(provider: 's3' | 'r2' | 'supabase', config: CloudConfig) {
    this.bucket = config.bucket
    this.pathPrefix = config.pathPrefix || ''

    if (provider === 'supabase') {
      if (!config.projectUrl || !config.anonKey) {
        throw new Error('Supabase project URL and anon key are required')
      }
      this.supabase = createClient(config.projectUrl, config.anonKey)
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
      if (this.supabase) {
        const { error } = await this.supabase.storage.from(this.bucket).list('', {
          limit: 1,
          offset: 0,
        })
        if (error) throw error
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

    if (this.supabase) {
      const fileBuffer = fs.readFileSync(filePath)
      const { error } = await this.supabase.storage.from(this.bucket).upload(fullKey, fileBuffer, {
        contentType: 'application/gzip',
        upsert: true,
      })
      if (error) {
        throw new Error(error.message)
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
