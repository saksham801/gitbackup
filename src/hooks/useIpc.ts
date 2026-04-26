import { useEffect } from 'react'

declare global {
  interface Window {
    api?: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void
    }
  }
}

const hasIpc = typeof window !== 'undefined' && typeof window.api !== 'undefined'

export function ipcInvoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  if (!hasIpc) {
    return Promise.resolve(undefined as unknown as T)
  }

  return window.api.invoke(channel, ...args) as Promise<T>
}

export function useIpcListener(
  channel: string,
  callback: (...args: unknown[]) => void,
) {
  useEffect(() => {
    if (!hasIpc) {
      return () => {}
    }

    const unsubscribe = window.api.on(channel, callback)
    return unsubscribe
  }, [channel, callback])
}
