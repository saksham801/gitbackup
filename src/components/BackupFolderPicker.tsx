import { ipcInvoke } from '../hooks/useIpc'

interface Props {
  path: string
  onPathChange: (path: string) => void
}

export default function BackupFolderPicker({ path, onPathChange }: Props) {
  const selectFolder = async () => {
    const selected = await ipcInvoke<string | null>('dialog:select-folder')
    if (selected) {
      onPathChange(selected)
    }
  }

  return (
    <div className="p-5 bg-[#111820] rounded-xl border border-gray-800/80">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">Backup Folder</h3>
          <p className="text-xs text-gray-500">Choose where your repositories will be cloned locally.</p>
        </div>
      </div>

      {/* Folder picker */}
      <div className="flex gap-2">
        <input
          type="text"
          value={path}
          readOnly
          placeholder="No folder selected"
          className="flex-1 bg-[#0a0e14] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 cursor-default"
        />
        <button
          onClick={selectFolder}
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          Browse
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Repositories will be cloned into this folder with all branches and code.
      </p>
    </div>
  )
}
