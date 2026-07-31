import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, TextArea } from '../../components/admin/FormField'
import { rolesApi } from '../../api/roles'
import { ApiError } from '../../lib/api'

const emptyForm = { name: '', description: '', permissions: [] }

function togglePermission(permissions, module, action) {
  const existing = permissions.find((p) => p.module === module)
  if (!existing) {
    return [...permissions, { module, actions: [action] }]
  }
  const hasAction = existing.actions.includes(action)
  const nextActions = hasAction ? existing.actions.filter((a) => a !== action) : [...existing.actions, action]
  return permissions
    .map((p) => (p.module === module ? { ...p, actions: nextActions } : p))
    .filter((p) => p.actions.length > 0)
}

export default function RolesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [catalog, setCatalog] = useState({ modules: [], actions: [] })

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
      const res = await rolesApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    rolesApi.permissionCatalog().then((res) => setCatalog(res.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ name: row.name, description: row.description || '', permissions: row.permissions || [] })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await rolesApi.update(editing._id, { name: form.name, description: form.description, permissions: form.permissions })
      } else {
        await rolesApi.create(form)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await rolesApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete role')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (row) => row.description || '—' },
    { key: 'isSystem', header: '', render: (row) => (row.isSystem ? <Badge tone="purple">System</Badge> : null) },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-[#9898A6] transition hover:bg-white/5 hover:text-white">
            <FiEdit2 size={16} />
          </button>
          {!row.isSystem && (
            <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-[#9898A6] transition hover:bg-red-500/10 hover:text-red-400">
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Control which modules and actions each role can access."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New role
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No roles yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit role' : 'New role'} width="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextArea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div>
            <p className="mb-2 text-sm font-medium text-[#9898A6]">Permissions</p>
            <div className="max-h-96 overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[#111115]">
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-[#6B6B78]">
                    <th className="px-4 py-2 font-medium">Module</th>
                    {catalog.actions.map((action) => (
                      <th key={action} className="px-3 py-2 text-center font-medium capitalize">
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catalog.modules.map((module) => {
                    const entry = form.permissions.find((p) => p.module === module)
                    return (
                      <tr key={module} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-2 capitalize text-[#E4E4E7]">{module}</td>
                        {catalog.actions.map((action) => (
                          <td key={action} className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(entry?.actions.includes(action))}
                              onChange={() => setForm({ ...form, permissions: togglePermission(form.permissions, module, action) })}
                              className="h-4 w-4 rounded border-white/10 bg-[#09090B]"
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
        title="Delete role"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
