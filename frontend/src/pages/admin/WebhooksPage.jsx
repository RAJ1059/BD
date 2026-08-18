import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, Checkbox } from '../../components/admin/FormField'
import { webhooksApi } from '../../api/webhooks'
import { ApiError } from '../../lib/api'

const emptyForm = {
  name: '',
  url: '',
  events: '',
  secret: '',
  isActive: true,
}

export default function WebhooksPage() {
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

  const [testingId, setTestingId] = useState(null)
  const [testMessage, setTestMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await webhooksApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load webhooks')
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
    setForm({
      name: row.name,
      url: row.url,
      events: (row.events || []).join(', '),
      secret: row.secret || '',
      isActive: row.isActive,
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
      events: form.events
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    try {
      if (editing) {
        await webhooksApi.update(editing._id, payload)
      } else {
        await webhooksApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save webhook')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await webhooksApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete webhook')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleTest = async (row) => {
    setTestingId(row._id)
    setTestMessage('')
    try {
      await webhooksApi.test(row._id)
      setTestMessage(`Test event sent to "${row.name}".`)
    } catch (err) {
      setTestMessage(err instanceof ApiError ? err.message : `Failed to send test event to "${row.name}".`)
    } finally {
      setTestingId(null)
      await load()
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'url',
      header: 'URL',
      render: (row) => <span className="block max-w-[220px] truncate" title={row.url}>{row.url}</span>,
    },
    {
      key: 'events',
      header: 'Events',
      render: (row) => (row.events || []).join(', ') || '—',
    },
    {
      key: 'isActive',
      header: 'Active',
      render: (row) => <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'lastStatus',
      header: 'Last Status',
      render: (row) => (
        <Badge tone={row.lastStatus === 'success' ? 'green' : row.lastStatus === 'failed' ? 'red' : 'neutral'}>
          {row.lastStatus || 'never run'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleTest(row)}
            disabled={testingId === row._id}
            className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            title="Send test event"
          >
            <FiSend size={16} />
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
        title="Webhooks"
        description="Notify external systems when events happen in this app."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New webhook
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}
      {testMessage && <Banner tone={testMessage.startsWith('Test event sent') ? 'success' : 'error'}>{testMessage}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No webhooks yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit webhook' : 'New webhook'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextInput
            label="URL"
            type="url"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <TextInput
            label="Events"
            value={form.events}
            onChange={(e) => setForm({ ...form, events: e.target.value })}
            hint="Comma-separated, e.g. lead.created, lead.updated"
          />
          <TextInput
            label="Secret"
            value={form.secret}
            onChange={(e) => setForm({ ...form, secret: e.target.value })}
            hint="Used for HMAC signing of the payload (optional)"
          />
          <Checkbox
            label="Active"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
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
        title="Delete webhook"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
