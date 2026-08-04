import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { TextInput } from '../../components/admin/FormField'
import { tagsApi } from '../../api/tags'
import { ApiError } from '../../lib/api'

export default function TagsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tagsApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setName(row.name)
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await tagsApi.update(editing._id, { name })
      } else {
        await tagsApi.create({ name })
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save tag')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await tagsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete tag')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white">
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
        title="Tags"
        description="Manage tags used across blog posts."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New tag
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No tags yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit tag' : 'New tag'} width="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete tag"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
