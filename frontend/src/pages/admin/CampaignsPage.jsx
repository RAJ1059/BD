import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { TextInput } from '../../components/admin/FormField'
import { campaignsApi } from '../../api/campaigns'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ApiError } from '../../lib/api'

const emptyForm = {
  name: '',
  baseUrl: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
}

export default function CampaignsPage() {
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
      const res = await campaignsApi.list({ page, limit: 20, search: debouncedSearch || undefined })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load campaigns')
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
      name: row.name,
      baseUrl: row.baseUrl,
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmTerm: row.utmTerm || '',
      utmContent: row.utmContent || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await campaignsApi.update(editing._id, form)
      } else {
        await campaignsApi.create(form)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save campaign')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await campaignsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete campaign')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'generatedUrl',
      header: 'Generated URL',
      render: (row) => (
        <span className="block max-w-xs truncate font-mono text-xs text-[#8B93A7]" title={row.generatedUrl}>
          {row.generatedUrl}
        </span>
      ),
    },
    {
      key: 'qrCodeDataUrl',
      header: 'QR Code',
      render: (row) => (row.qrCodeDataUrl ? <img src={row.qrCodeDataUrl} alt="QR code" className="h-10 w-10 rounded" /> : '—'),
    },
    { key: 'clickCount', header: 'Clicks', render: (row) => row.clickCount ?? 0 },
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
        title="Campaigns"
        description="Build and track UTM-tagged campaign links."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New campaign
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
        searchPlaceholder="Search campaigns..."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No campaigns yet."
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit campaign' : 'New campaign'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextInput
            label="Base URL"
            required
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            hint="e.g. https://example.com/landing-page"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="UTM Source" required value={form.utmSource} onChange={(e) => setForm({ ...form, utmSource: e.target.value })} />
            <TextInput label="UTM Medium" required value={form.utmMedium} onChange={(e) => setForm({ ...form, utmMedium: e.target.value })} />
          </div>
          <TextInput label="UTM Campaign" required value={form.utmCampaign} onChange={(e) => setForm({ ...form, utmCampaign: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="UTM Term" value={form.utmTerm} onChange={(e) => setForm({ ...form, utmTerm: e.target.value })} />
            <TextInput label="UTM Content" value={form.utmContent} onChange={(e) => setForm({ ...form, utmContent: e.target.value })} />
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
        title="Delete campaign"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
