import { useEffect, useState, useCallback } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, Checkbox } from '../../components/admin/FormField'
import { socialApi } from '../../api/social'
import { ApiError } from '../../lib/api'

const SOCIAL_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'youtube', 'twitter', 'tiktok', 'threads']

export default function SocialLinksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [url, setUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await socialApi.list()
      setLinks(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load social links')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rows = SOCIAL_PLATFORMS.map((platform) => {
    const link = links.find((l) => l.platform === platform)
    return {
      platform,
      link,
      url: link?.url || '',
      isActive: link ? link.isActive : false,
      clickCount: link?.clickCount || 0,
      configured: Boolean(link),
    }
  })

  const openEdit = (row) => {
    setEditingPlatform(row.platform)
    setUrl(row.url)
    setIsActive(row.configured ? row.isActive : true)
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await socialApi.upsert(editingPlatform, { url, isActive })
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save social link')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await socialApi.remove(deleteTarget.platform)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete social link')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'platform', header: 'Platform' },
    {
      key: 'url',
      header: 'URL',
      render: (row) => (row.configured ? row.url : <span className="text-[#5B6478]">Not configured</span>),
    },
    { key: 'clickCount', header: 'Clicks' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) =>
        row.configured ? <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> : <Badge tone="neutral">Not configured</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(row)} className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white">
            <FiEdit2 size={16} />
          </button>
          {row.configured && (
            <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400">
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Social Links" description="Manage social media links shown across the site." />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} rowKey={(row) => row.platform} loading={loading} emptyLabel="No platforms." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Edit ${editingPlatform || ''}`} width="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="URL" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <Checkbox label="Active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
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
        title="Delete social link"
        description={`Delete the ${deleteTarget?.platform} link? This can't be undone.`}
      />
    </div>
  )
}
