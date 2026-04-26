import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const isElectronBuild = process.env.BUILD_ELECTRON === 'true'

export default async () => {
  const plugins = [react(), tailwindcss()]

  if (isElectronBuild) {
    const electron = (await import('vite-plugin-electron')).default

    plugins.push(
      electron([
        {
          entry: 'electron/main.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                external: [
                  'electron',
                  'electron-store',
                  'simple-git',
                  'electron-log',
                  '@octokit/rest',
                  '@aws-sdk/client-s3',
                  '@aws-sdk/lib-storage',
                  'tar',
                  'node-cron',
                  'p-limit',
                ],
              },
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          onstart(args) {
            args.reload()
          },
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                external: ['electron'],
              },
            },
          },
        },
      ]),
    )
  }

  return defineConfig({
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  })
}
