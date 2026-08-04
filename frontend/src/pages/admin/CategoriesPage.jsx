import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { TextInput, TextArea, Select } from '../../components/admin/FormField'
import { categoriesApi } from '../../api/categories'
import { ApiError } from '../../lib/api'

const emptyForm = { name: '', description: '', parent: '' }

export default function CategoriesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await categoriesApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ name: row.name, description: row.description || '', parent: row.parent?._id || '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = { name: form.name, description: form.description, parent: form.parent || null }
    try {
      if (editing) {
        await categoriesApi.update(editing._id, payload)
      } else {
        await categoriesApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoriesApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete category')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'parent', header: 'Parent', render: (row) => row.parent?.name || '—' },
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
        title="Categories"
        description="Organize blog content into categories."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New category
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No categories yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextArea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Parent category" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
            <option value="">None</option>
            {rows
              .filter((r) => r._id !== editing?._id)
              .map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
          </Select>
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
        title="Delete category"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
