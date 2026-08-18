import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, Select, Checkbox } from '../../components/admin/FormField'
import { redirectsApi } from '../../api/redirects'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ApiError } from '../../lib/api'

const emptyForm = {
  fromPath: '',
  toPath: '',
  statusCode: 301,
  isActive: true,
}

export default function RedirectsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
      const res = await redirectsApi.list({ page, limit: 20, search: debouncedSearch || undefined })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load redirects')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

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
    setForm({
      fromPath: row.fromPath,
      toPath: row.toPath,
      statusCode: row.statusCode,
      isActive: row.isActive,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = { ...form, statusCode: Number(form.statusCode) }
    try {
      if (editing) {
        await redirectsApi.update(editing._id, payload)
      } else {
        await redirectsApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save redirect')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await redirectsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete redirect')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'fromPath', header: 'From' },
    { key: 'toPath', header: 'To' },
    { key: 'statusCode', header: 'Status', render: (row) => <Badge tone={row.statusCode === 301 ? 'blue' : 'orange'}>{row.statusCode}</Badge> },
    { key: 'hitCount', header: 'Hits' },
    { key: 'isActive', header: 'Active', render: (row) => <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
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
        title="Redirects"
        description="Manage URL redirects for the site."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New redirect
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Search redirects..."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No redirects yet."
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit redirect' : 'New redirect'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="From path" required value={form.fromPath} onChange={(e) => setForm({ ...form, fromPath: e.target.value })} placeholder="/old-path" />
          <TextInput label="To path" required value={form.toPath} onChange={(e) => setForm({ ...form, toPath: e.target.value })} placeholder="/new-path" />
          <Select label="Status code" value={form.statusCode} onChange={(e) => setForm({ ...form, statusCode: e.target.value })}>
            <option value={301}>301 - Permanent</option>
            <option value={302}>302 - Temporary</option>
          </Select>
          <Checkbox label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
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
        title="Delete redirect"
        description={`Delete redirect "${deleteTarget?.fromPath}"? This can't be undone.`}
      />
    </div>
  )
}
