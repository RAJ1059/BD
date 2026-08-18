import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, TextArea, Select, Checkbox } from '../../components/admin/FormField'
import { scriptsApi } from '../../api/scripts'
import { ApiError } from '../../lib/api'

const PROVIDERS = [
  'gtm',
  'ga4',
  'meta_pixel',
  'linkedin_insight',
  'clarity',
  'hotjar',
  'tiktok_pixel',
  'pinterest_tag',
  'reddit_pixel',
  'custom_html',
  'custom_css',
  'custom_js',
]
const PLACEMENTS = ['head', 'body_start', 'body_end']

const PROVIDER_LABELS = {
  gtm: 'GTM',
  ga4: 'GA4',
  meta_pixel: 'Meta pixel',
  linkedin_insight: 'LinkedIn insight',
  clarity: 'Clarity',
  hotjar: 'Hotjar',
  tiktok_pixel: 'TikTok pixel',
  pinterest_tag: 'Pinterest tag',
  reddit_pixel: 'Reddit pixel',
  custom_html: 'Custom HTML',
  custom_css: 'Custom CSS',
  custom_js: 'Custom JS',
}

const emptyForm = {
  name: '',
  provider: 'gtm',
  placement: 'head',
  code: '',
  targetPages: '',
  isActive: true,
  scheduleStart: '',
  scheduleEnd: '',
}

export default function ScriptsPage() {
  const [rows, setRows] = useState([])
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
      const res = await scriptsApi.list({ page, limit: 20 })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load scripts')
    } finally {
      setLoading(false)
    }
  }, [page])

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
      provider: row.provider,
      placement: row.placement,
      code: row.code || '',
      targetPages: (row.targetPages || []).join(', '),
      isActive: row.isActive,
      scheduleStart: row.scheduleStart ? row.scheduleStart.slice(0, 10) : '',
      scheduleEnd: row.scheduleEnd ? row.scheduleEnd.slice(0, 10) : '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      name: form.name,
      provider: form.provider,
      placement: form.placement,
      code: form.code,
      isActive: form.isActive,
      targetPages: form.targetPages
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      scheduleStart: form.scheduleStart || undefined,
      scheduleEnd: form.scheduleEnd || undefined,
    }
    try {
      if (editing) {
        await scriptsApi.update(editing._id, payload)
      } else {
        await scriptsApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save script')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (row) => {
    try {
      await scriptsApi.toggle(row._id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to toggle script')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await scriptsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete script')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'provider', header: 'Provider', render: (row) => <Badge tone="purple">{PROVIDER_LABELS[row.provider] || row.provider}</Badge> },
    { key: 'placement', header: 'Placement', render: (row) => <Badge tone="blue">{row.placement}</Badge> },
    {
      key: 'isActive',
      header: 'Active',
      render: (row) => (
        <button onClick={() => handleToggle(row)}>
          <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>
        </button>
      ),
    },
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
        title="Scripts"
        description="Manage tracking pixels, GTM, and custom code injection."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New script
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No scripts yet."
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit script' : 'New script'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </Select>
            <Select label="Placement" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <TextArea
            label="Code"
            hint="Tracking ID for known providers, or raw HTML/CSS/JS for custom providers"
            rows={6}
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="font-mono"
          />
          <TextInput
            label="Target pages"
            hint="Comma-separated paths. Leave blank for all pages."
            value={form.targetPages}
            onChange={(e) => setForm({ ...form, targetPages: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Schedule start"
              type="date"
              value={form.scheduleStart}
              onChange={(e) => setForm({ ...form, scheduleStart: e.target.value })}
            />
            <TextInput
              label="Schedule end"
              type="date"
              value={form.scheduleEnd}
              onChange={(e) => setForm({ ...form, scheduleEnd: e.target.value })}
            />
          </div>
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
        title="Delete script"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
