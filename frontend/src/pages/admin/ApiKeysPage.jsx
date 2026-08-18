import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiTrash2, FiSlash, FiCopy } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput } from '../../components/admin/FormField'
import { apiKeysApi } from '../../api/apiKeys'
import { ApiError } from '../../lib/api'

const emptyForm = {
  name: '',
  scopes: '',
  expiresAt: '',
}

export default function ApiKeysPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [createdKey, setCreatedKey] = useState(null)
  const [copied, setCopied] = useState(false)

  const [revokeTarget, setRevokeTarget] = useState(null)
  const [revoking, setRevoking] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiKeysApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setFormError('')
    setCreatedKey(null)
    setCopied(false)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setCreatedKey(null)
    setCopied(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      name: form.name,
      scopes: form.scopes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      expiresAt: form.expiresAt || undefined,
    }
    try {
      const res = await apiKeysApi.create(payload)
      setCreatedKey(res.data.key)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create API key')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdKey)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const handleDone = async () => {
    setModalOpen(false)
    setCreatedKey(null)
    setCopied(false)
    await load()
  }

  const handleRevoke = async () => {
    setRevoking(true)
    try {
      await apiKeysApi.revoke(revokeTarget._id)
      setRevokeTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to revoke API key')
      setRevokeTarget(null)
    } finally {
      setRevoking(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiKeysApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete API key')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'keyPrefix',
      header: 'Key',
      render: (row) => <code className="rounded bg-white/5 px-2 py-1 text-xs text-[#E4E4E7]">{row.keyPrefix}...</code>,
    },
    {
      key: 'scopes',
      header: 'Scopes',
      render: (row) => (row.scopes || []).join(', ') || '—',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Revoked'}</Badge>,
    },
    {
      key: 'lastUsedAt',
      header: 'Last Used',
      render: (row) => (row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleDateString() : 'Never'),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (row) => (row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          {row.isActive && (
            <button
              onClick={() => setRevokeTarget(row)}
              className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white"
              title="Revoke"
            >
              <FiSlash size={16} />
            </button>
          )}
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
        title="API Keys"
        description="Create and manage API keys for third-party integrations."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New API key
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No API keys yet." />

      <Modal open={modalOpen} onClose={closeModal} title={createdKey ? 'API key created' : 'New API key'} width="max-w-lg">
        {createdKey ? (
          <div className="space-y-4">
            <Banner tone="success">This is the only time you'll see this key — copy it now. It cannot be retrieved again.</Banner>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextInput label="API key" readOnly value={createdKey} className="font-mono" />
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="mb-0.5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                <FiCopy /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <PrimaryButton type="button" onClick={handleDone}>
                Done
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <Banner>{formError}</Banner>}
            <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextInput
              label="Scopes"
              value={form.scopes}
              onChange={(e) => setForm({ ...form, scopes: e.target.value })}
              hint="Comma-separated, e.g. leads:read, leads:write"
            />
            <TextInput
              label="Expires At"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              hint="Optional"
            />
            <div className="flex justify-end gap-3 pt-2">
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        confirming={revoking}
        title="Revoke API key"
        description={`Revoke "${revokeTarget?.name}"? Requests using this key will stop working immediately.`}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete API key"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
