import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, Select } from '../../components/admin/FormField'
import { projectsApi } from '../../api/projects'
import { clientsApi } from '../../api/clients'
import { usersApi } from '../../api/users'
import { ApiError } from '../../lib/api'

const STATUSES = ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']
const STATUS_TONES = { not_started: 'neutral', in_progress: 'blue', on_hold: 'orange', completed: 'green', cancelled: 'red' }

const emptyForm = { name: '', client: '', status: 'not_started', budget: '', deadline: '', progress: 0, assignedTeam: [] }

export default function ProjectsPage() {
  const [rows, setRows] = useState([])
  const [clients, setClients] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
      const res = await projectsApi.list({ page, limit: 20 })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    clientsApi.list({ limit: 100 }).then((res) => setClients(res.data)).catch(() => {})
    usersApi.list({ limit: 100 }).then((res) => setTeamMembers(res.data)).catch(() => {})
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
      name: row.name,
      client: row.client?._id || '',
      status: row.status,
      budget: row.budget ?? '',
      deadline: row.deadline ? row.deadline.slice(0, 10) : '',
      progress: row.progress ?? 0,
      assignedTeam: (row.assignedTeam || []).map((u) => u._id),
    })
    setFormError('')
    setModalOpen(true)
  }

  const toggleTeamMember = (id) => {
    setForm((f) => ({
      ...f,
      assignedTeam: f.assignedTeam.includes(id) ? f.assignedTeam.filter((x) => x !== id) : [...f.assignedTeam, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      name: form.name,
      client: form.client,
      budget: form.budget === '' ? undefined : Number(form.budget),
      deadline: form.deadline || undefined,
      assignedTeam: form.assignedTeam,
      ...(editing ? { status: form.status, progress: Number(form.progress) } : {}),
    }
    try {
      if (editing) {
        await projectsApi.update(editing._id, payload)
      } else {
        await projectsApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete project')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Project' },
    { key: 'client', header: 'Client', render: (row) => row.client?.companyName || '—' },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={STATUS_TONES[row.status]}>{row.status.replace('_', ' ')}</Badge> },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-[#A050F8]" style={{ width: `${row.progress || 0}%` }} />
          </div>
          <span className="text-xs text-[#9898A6]">{row.progress || 0}%</span>
        </div>
      ),
    },
    { key: 'deadline', header: 'Deadline', render: (row) => (row.deadline ? new Date(row.deadline).toLocaleDateString() : '—') },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-[#9898A6] transition hover:bg-white/5 hover:text-white">
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-[#9898A6] transition hover:bg-red-500/10 hover:text-red-400">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Track delivery status across client projects."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New project
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} emptyLabel="No projects yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit project' : 'New project'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Client" required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}>
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.companyName}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Budget" type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <TextInput label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
              <TextInput
                label="Progress (%)"
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: e.target.value })}
              />
            </div>
          )}
          <div>
            <p className="mb-2 text-sm font-medium text-[#9898A6]">Assigned team</p>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-white/10 p-3">
              {teamMembers.map((m) => (
                <label key={m._id} className="flex items-center gap-2 text-sm text-[#E4E4E7]">
                  <input
                    type="checkbox"
                    checked={form.assignedTeam.includes(m._id)}
                    onChange={() => toggleTeamMember(m._id)}
                    className="h-4 w-4 rounded border-white/10 bg-[#09090B]"
                  />
                  {m.name}
                </label>
              ))}
            </div>
          </div>
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
        title="Delete project"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
