import { useEffect, useState, useCallback } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import PageHeader, { SecondaryButton, Banner } from '../../components/admin/PageHeader'
import { logsApi } from '../../api/logs'
import { ApiError } from '../../lib/api'

export default function ErrorLogsPage() {
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await logsApi.errors()
      setLines(res.data || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load error logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <PageHeader
        title="Error Logs"
        description="Most recent entries from the server error log."
        actions={
          <SecondaryButton onClick={load} disabled={loading}>
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </SecondaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <div className="rounded-2xl border border-white/10 bg-[#141928]">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[#5B6478]">Loading...</div>
        ) : lines.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#5B6478]">No error log entries found.</div>
        ) : (
          <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-[#E4E4E7]">
            {lines.map((line, idx) => (
              <div key={idx} className="border-b border-white/5 py-1 last:border-0">
                {line}
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  )
}
