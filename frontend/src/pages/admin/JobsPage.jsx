import { useEffect, useState, useCallback } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Badge from '../../components/admin/Badge'
import { jobsApi } from '../../api/jobs'
import { ApiError } from '../../lib/api'

export default function JobsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [retryingId, setRetryingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await jobsApi.list({ page, limit: 30 })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleRetry = async (row) => {
    setRetryingId(row._id)
    setError('')
    try {
      await jobsApi.retry(row._id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to retry job')
    } finally {
      setRetryingId(null)
    }
  }

  const statusTone = (status) => {
    if (status === 'completed') return 'green'
    if (status === 'failed') return 'red'
    if (status === 'processing') return 'blue'
    return 'neutral'
  }

  const columns = [
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: 'attempts', header: 'Attempts', render: (row) => `${row.attempts} / ${row.maxAttempts}` },
    {
      key: 'lastError',
      header: 'Last Error',
      render: (row) => (row.lastError ? <span className="block max-w-xs truncate text-xs text-red-400" title={row.lastError}>{row.lastError}</span> : '—'),
    },
    { key: 'createdAt', header: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end">
          <button
            onClick={() => handleRetry(row)}
            disabled={row.status !== 'failed' || retryingId === row._id}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-40"
          >
            <FiRefreshCw size={14} />
            {retryingId === row._id ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Jobs" description="Background job queue — send-email and other async tasks." />
      {error && <Banner>{error}</Banner>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No jobs found."
      />
    </div>
  )
}
