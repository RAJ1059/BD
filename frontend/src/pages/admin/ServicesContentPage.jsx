import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { servicesApi } from '../../api/services'
import { ApiError } from '../../lib/api'

export default function ServicesContentPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await servicesApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await servicesApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete service')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    { key: 'order', header: 'Order' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/services-content/${row._id}`)}
            className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white"
          >
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services listed on the public Services page."
        actions={
          <PrimaryButton onClick={() => navigate('/admin/services-content/new')}>
            <FiPlus /> New service
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No services yet." />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete service"
        description={`Delete "${deleteTarget?.title}"? This can't be undone.`}
      />
    </div>
  )
}
