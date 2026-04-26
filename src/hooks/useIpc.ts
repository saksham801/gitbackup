import { useEffect } from 'react'

type IpcApi = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void
}

const getIpcApi = (): IpcApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return (window as Window & { api?: IpcApi }).api
}

export function ipcInvoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  const api = getIpcApi()
  if (!api) {
    return Promise.resolve(undefined as unknown as T)
  }

  return api.invoke(channel, ...args) as Promise<T>
}

export function useIpcListener(
  channel: string,
  callback: (...args: unknown[]) => void,
) {
  useEffect(() => {
    const api = getIpcApi()
    if (!api) {
      return () => {}
    }

    const unsubscribe = api.on(channel, callback)
    return unsubscribe
  }, [channel, callback])
}
