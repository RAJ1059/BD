import { useEffect, useState, useCallback } from 'react'
import { FiDownload, FiRefreshCw } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { backupsApi } from '../../api/backups'
import { ApiError } from '../../lib/api'

function formatSize(bytes) {
  if (bytes === undefined || bytes === null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BackupsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [creating, setCreating] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState(null)
  const [restoring, setRestoring] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await backupsApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load backups')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    setCreating(true)
    setError('')
    try {
      await backupsApi.createNow()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create backup')
    } finally {
      setCreating(false)
    }
  }

  const handleRestore = async () => {
    setRestoring(true)
    setError('')
    try {
      await backupsApi.restore(restoreTarget.fileName)
      setRestoreTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to restore backup')
      setRestoreTarget(null)
    } finally {
      setRestoring(false)
    }
  }

  const columns = [
    { key: 'fileName', header: 'File Name' },
    { key: 'sizeBytes', header: 'Size', render: (row) => formatSize(row.sizeBytes) },
    { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <a
            href={backupsApi.downloadUrl(row.fileName)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5"
          >
            <FiDownload size={14} />
            Download
          </a>
          <button
            onClick={() => setRestoreTarget(row)}
            className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Restore
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Backups"
        description="Snapshots of the database that can be downloaded or restored from."
        actions={
          <PrimaryButton onClick={handleCreate} disabled={creating}>
            <FiRefreshCw /> {creating ? 'Creating...' : 'Create backup now'}
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No backups yet." />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        confirming={restoring}
        title="Restore backup"
        description={`This will overwrite your current database with the contents of "${restoreTarget?.fileName}". This cannot be undone.`}
      />
    </div>
  )
}
