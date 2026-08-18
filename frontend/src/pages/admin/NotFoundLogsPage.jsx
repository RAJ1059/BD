import { useEffect, useState, useCallback } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { notFoundLogsApi } from '../../api/notFoundLogs'
import { ApiError } from '../../lib/api'

export default function NotFoundLogsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await notFoundLogsApi.list({ page, limit: 25 })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load 404 logs')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await notFoundLogsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete log entry')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'path', header: 'Path', render: (row) => <span className="font-mono text-xs">{row.path}</span> },
    { key: 'hitCount', header: 'Hits' },
    { key: 'referrer', header: 'Referrer', render: (row) => row.referrer || '—' },
    { key: 'ip', header: 'IP', render: (row) => row.ip || '—' },
    { key: 'lastSeenAt', header: 'Last seen', render: (row) => (row.lastSeenAt ? new Date(row.lastSeenAt).toLocaleString() : '—') },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Not-Found Logs" description="404 hits recorded on the site, useful for finding broken links to redirect." />
      {error && <Banner>{error}</Banner>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No 404s recorded yet."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete log entry"
        description={`Delete the 404 log for "${deleteTarget?.path}"? This can't be undone.`}
      />
    </div>
  )
}
