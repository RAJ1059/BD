import { useEffect, useState, useCallback } from 'react'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Badge from '../../components/admin/Badge'
import { activityLogsApi } from '../../api/activityLogs'
import { ApiError } from '../../lib/api'

export default function ActivityLogsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await activityLogsApi.list({ page, limit: 25 })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    { key: 'actor', header: 'Actor', render: (row) => row.actor?.name || row.actorName || 'System' },
    { key: 'action', header: 'Action', render: (row) => <Badge tone="purple">{row.action}</Badge> },
    { key: 'module', header: 'Module', render: (row) => <span className="capitalize">{row.module}</span> },
    { key: 'description', header: 'Description' },
    { key: 'createdAt', header: 'When', render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  return (
    <div>
      <PageHeader title="Activity Logs" description="Audit trail of actions taken across the admin portal." />
      {error && <Banner>{error}</Banner>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No activity recorded yet."
      />
    </div>
  )
}
