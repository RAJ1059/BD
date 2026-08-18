import { useEffect, useState, useCallback } from 'react'
import { FiPlay } from 'react-icons/fi'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Badge from '../../components/admin/Badge'
import { cronJobsApi } from '../../api/cronJobs'
import { ApiError } from '../../lib/api'

export default function CronJobsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [togglingId, setTogglingId] = useState(null)
  const [runningId, setRunningId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await cronJobsApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load cron jobs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleToggle = async (row) => {
    setTogglingId(row._id)
    setError('')
    try {
      await cronJobsApi.update(row._id, { isActive: !row.isActive })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update cron job')
    } finally {
      setTogglingId(null)
    }
  }

  const handleRunNow = async (row) => {
    setRunningId(row._id)
    setError('')
    try {
      await cronJobsApi.runNow(row._id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to run cron job')
    } finally {
      setRunningId(null)
    }
  }

  const statusTone = (status) => {
    if (status === 'success') return 'green'
    if (status === 'failed') return 'red'
    return 'neutral'
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'schedule', header: 'Schedule', render: (row) => <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[#E4E4E7]">{row.schedule}</code> },
    { key: 'taskKey', header: 'Task Key' },
    {
      key: 'isActive',
      header: 'Active',
      render: (row) => (
        <button
          onClick={() => handleToggle(row)}
          disabled={togglingId === row._id}
          className={`relative h-6 w-11 rounded-full transition disabled:opacity-60 ${row.isActive ? 'bg-[#05B0BA]' : 'bg-white/10'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${row.isActive ? 'left-[22px]' : 'left-0.5'}`}
          />
        </button>
      ),
    },
    { key: 'lastRunAt', header: 'Last Run', render: (row) => (row.lastRunAt ? new Date(row.lastRunAt).toLocaleString() : '—') },
    {
      key: 'lastStatus',
      header: 'Last Status',
      render: (row) => (row.lastStatus ? <Badge tone={statusTone(row.lastStatus)}>{row.lastStatus}</Badge> : <Badge tone="neutral">never run</Badge>),
    },
    {
      key: 'lastError',
      header: 'Last Error',
      render: (row) => (row.lastError ? <span className="block max-w-xs truncate text-xs text-red-400" title={row.lastError}>{row.lastError}</span> : '—'),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end">
          <button
            onClick={() => handleRunNow(row)}
            disabled={runningId === row._id}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-60"
          >
            <FiPlay size={14} />
            {runningId === row._id ? 'Running...' : 'Run now'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Cron Jobs" description="Scheduled background tasks registered with the server." />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No cron jobs registered." />
    </div>
  )
}
