import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiTrash2, FiDownload, FiArrowLeft } from 'react-icons/fi'
import PageHeader, { SecondaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { formsApi } from '../../api/forms'
import { ApiError } from '../../lib/api'

export default function FormSubmissionsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [formRes, subsRes] = await Promise.all([formsApi.get(id), formsApi.submissions(id)])
      setForm(formRes.data)
      setRows(subsRes.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await formsApi.deleteSubmission(id, deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete submission')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'data', header: 'Data', render: (row) => <span className="text-xs">{JSON.stringify(row.data)}</span> },
    { key: 'createdAt', header: 'Submitted At', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={form ? `Submissions — ${form.name}` : 'Submissions'}
        description="View and manage submissions received through this form."
        actions={
          <div className="flex gap-3">
            <SecondaryButton onClick={() => navigate('/admin/forms')}>
              <FiArrowLeft /> Back to forms
            </SecondaryButton>
            <a
              href={formsApi.exportSubmissionsUrl(id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#05B0BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              <FiDownload /> Export CSV
            </a>
          </div>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No submissions yet." />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete submission"
        description="Delete this submission? This can't be undone."
      />
    </div>
  )
}
