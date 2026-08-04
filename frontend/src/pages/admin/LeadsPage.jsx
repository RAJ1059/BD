import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiMessageSquare, FiCheckCircle } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, Select } from '../../components/admin/FormField'
import { leadsApi } from '../../api/leads'
import { usersApi } from '../../api/users'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { can } from '../../lib/permissions'

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const SOURCES = ['website', 'referral', 'google_ads', 'facebook_ads', 'linkedin', 'walk_in', 'cold_call', 'email', 'other']
const STATUS_TONES = { new: 'blue', contacted: 'purple', qualified: 'purple', proposal: 'orange', negotiation: 'orange', won: 'green', lost: 'red' }

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
  source: 'website',
  estimatedValue: '',
  assignedTo: '',
}

export default function LeadsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [assignees, setAssignees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [detailLead, setDetailLead] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [detailBusy, setDetailBusy] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await leadsApi.list({ page, limit: 20, search: debouncedSearch || undefined, status: statusFilter || undefined })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    usersApi.list({ limit: 100 }).then((res) => setAssignees(res.data)).catch(() => {})
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
      source: row.source || 'website',
      estimatedValue: row.estimatedValue ?? '',
      assignedTo: row.assignedTo?._id || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = { ...form, assignedTo: form.assignedTo || undefined, estimatedValue: form.estimatedValue === '' ? undefined : Number(form.estimatedValue) }
    try {
      if (editing) {
        await leadsApi.update(editing._id, payload)
      } else {
        await leadsApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save lead')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (row, status) => {
    try {
      await leadsApi.updateStatus(row._id, status)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update status')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await leadsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete lead')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const openDetail = async (row) => {
    setDetailBusy(true)
    try {
      const res = await leadsApi.get(row._id)
      setDetailLead(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load lead')
    } finally {
      setDetailBusy(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setDetailBusy(true)
    try {
      const res = await leadsApi.addNote(detailLead._id, noteText.trim())
      setDetailLead(res.data)
      setNoteText('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add note')
    } finally {
      setDetailBusy(false)
    }
  }

  const handleConvert = async () => {
    setDetailBusy(true)
    try {
      await leadsApi.convert(detailLead._id)
      setDetailLead(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to convert lead')
    } finally {
      setDetailBusy(false)
    }
  }

  const columns = [
    { key: 'companyName', header: 'Company' },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'source', header: 'Source', render: (row) => <span className="capitalize">{row.source?.replace('_', ' ')}</span> },
    { key: 'estimatedValue', header: 'Value', render: (row) => (row.estimatedValue ? `$${row.estimatedValue.toLocaleString()}` : '—') },
    { key: 'assignedTo', header: 'Assigned To', render: (row) => row.assignedTo?.name || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0B0E14] px-2 py-1 text-xs capitalize text-white outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openDetail(row)} className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white">
            <FiMessageSquare size={16} />
          </button>
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
        title="Leads"
        description="Track and progress your sales pipeline."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New lead
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatusFilter('')
            setPage(1)
          }}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
            statusFilter === '' ? 'bg-[#05B0BA] text-white' : 'bg-white/5 text-[#8B93A7] hover:bg-white/10'
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s)
              setPage(1)
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
              statusFilter === s ? 'bg-[#05B0BA] text-white' : 'bg-white/5 text-[#8B93A7] hover:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Search leads..."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No leads yet."
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit lead' : 'New lead'} width="max-w-2xl">
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
          <div className="grid grid-cols-3 gap-4">
            <Select label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </Select>
            <TextInput
              label="Estimated value"
              type="number"
              min="0"
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
            />
            <Select label="Assigned to" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(detailLead)} onClose={() => setDetailLead(null)} title={detailLead?.companyName || ''} width="max-w-xl">
        {detailLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONES[detailLead.status]}>{detailLead.status}</Badge>
              {detailLead.convertedToClient && <Badge tone="green">Converted to client</Badge>}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#8B93A7]">Notes</p>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {(detailLead.notes || []).length === 0 && <p className="text-sm text-[#5B6478]">No notes yet.</p>}
                {(detailLead.notes || []).map((note, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-[#0B0E14] p-3 text-sm">
                    <p className="text-[#E4E4E7]">{note.text}</p>
                    <p className="mt-1 text-xs text-[#5B6478]">
                      {note.author?.name || 'Unknown'} · {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white outline-none focus:border-[#05B0BA]"
                />
                <SecondaryButton type="button" onClick={handleAddNote} disabled={detailBusy}>
                  Add
                </SecondaryButton>
              </div>
            </div>

            {detailLead.status === 'won' && !detailLead.convertedToClient && can(user, 'leads', 'approve') && (
              <PrimaryButton type="button" onClick={handleConvert} disabled={detailBusy}>
                <FiCheckCircle /> Convert to client
              </PrimaryButton>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete lead"
        description={`Delete "${deleteTarget?.companyName}"? This can't be undone.`}
      />
    </div>
  )
}
