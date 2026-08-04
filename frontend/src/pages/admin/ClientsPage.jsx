import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, TextArea, Select } from '../../components/admin/FormField'
import { clientsApi } from '../../api/clients'
import { usersApi } from '../../api/users'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ApiError } from '../../lib/api'

const emptyForm = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  whatsapp: '',
  website: '',
  industry: '',
  country: '',
  address: '',
  status: 'active',
  accountManager: '',
  tags: '',
  notes: '',
}

const STATUS_TONES = { active: 'green', inactive: 'neutral', archived: 'red' }

export default function ClientsPage() {
  const [rows, setRows] = useState([])
  const [managers, setManagers] = useState([])
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
      const res = await clientsApi.list({ page, limit: 20, search: debouncedSearch || undefined })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    usersApi.list({ limit: 100 }).then((res) => setManagers(res.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      companyName: row.companyName,
      contactPerson: row.contactPerson,
      email: row.email,
      phone: row.phone || '',
      whatsapp: row.whatsapp || '',
      website: row.website || '',
      industry: row.industry || '',
      country: row.country || '',
      address: row.address || '',
      status: row.status,
      accountManager: row.accountManager?._id || '',
      tags: (row.tags || []).join(', '),
      notes: row.notes || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      accountManager: form.accountManager || undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    try {
      if (editing) {
        await clientsApi.update(editing._id, payload)
      } else {
        await clientsApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await clientsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete client')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'companyName', header: 'Company' },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={STATUS_TONES[row.status]}>{row.status}</Badge> },
    { key: 'accountManager', header: 'Account Manager', render: (row) => row.accountManager?.name || '—' },
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
        title="Clients"
        description="Manage your CRM client accounts."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New client
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
        searchPlaceholder="Search clients..."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No clients yet."
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit client' : 'New client'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Company name" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <TextInput label="Contact person" required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <TextInput label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextInput label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <TextInput label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <TextInput label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <TextInput label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <TextInput label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </Select>
            <Select label="Account manager" value={form.accountManager} onChange={(e) => setForm({ ...form, accountManager: e.target.value })}>
              <option value="">Unassigned</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <TextInput label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} hint="Comma-separated" />
          <TextArea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
        title="Delete client"
        description={`Delete "${deleteTarget?.companyName}"? This can't be undone.`}
      />
    </div>
  )
}
