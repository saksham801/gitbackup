import Store from 'electron-store'

interface StoreSchema {
  githubToken: string
  backupPath: string
  cloudProvider: 's3' | 'r2' | 'none'
  cloudConfig: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
    pathPrefix?: string
  }
  repoFilters: {
    owned: boolean
    organization: boolean
    starred: boolean
    forked: boolean
    collaborator: boolean
  }
  selectedRepoIds: number[]
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
    concurrencyLimit: 5,
  },
})

export default store
