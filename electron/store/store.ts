import Store from 'electron-store'

interface StoreSchema {
  githubToken: string
  backupPath: string
  cloudProvider: 's3' | 'r2' | 'none'
  cloudConfig: {
    bucket: string
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
    endpoint?: string
    pathPrefix?: string
    projectUrl?: string
    anonKey?: string
  }
  repoFilters: {
    owned: boolean
    organization: boolean
    starred: boolean
    forked: boolean
    collaborator: boolean
  }
  selectedRepoIds: number[]
  supabaseAuth: {
    enabled: boolean
    projectUrl: string
    anonKey: string
    allowedEmail: string
  }
  schedule: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
  concurrencyLimit: number
}

const store = new Store<StoreSchema>({
  name: 'gitbackup-config',
  encryptionKey: 'gitbackup-v1-enc',
  defaults: {
    githubToken: '',
    backupPath: '',
    cloudProvider: 'none',
    cloudConfig: {
      bucket: '',
      region: 'us-east-1',
      accessKeyId: '',
      secretAccessKey: '',
      endpoint: '',
      pathPrefix: '',
      projectUrl: '',
      anonKey: '',
    },
    repoFilters: {
      owned: true,
      organization: false,
      starred: false,
      forked: false,
      collaborator: false,
    },
    selectedRepoIds: [],
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '02:00',
    },
    supabaseAuth: {
      enabled: false,
      projectUrl: '',
      anonKey: '',
      allowedEmail: '',
    },
    concurrencyLimit: 5,
  },
})

export default store
