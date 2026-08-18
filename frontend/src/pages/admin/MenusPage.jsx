import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, Select, Checkbox } from '../../components/admin/FormField'
import { menusApi } from '../../api/menus'
import { ApiError } from '../../lib/api'

const MENU_LOCATIONS = ['header', 'footer', 'sidebar']
const MENU_TARGETS = ['_self', '_blank']

const LOCATION_TONES = { header: 'blue', footer: 'purple', sidebar: 'orange' }

const emptyItem = () => ({ label: '', url: '', order: 0, target: '_self', icon: '' })

const emptyForm = {
  name: '',
  location: 'header',
  isActive: true,
  items: [],
}

export default function MenusPage() {
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

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await menusApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load menus')
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
      location: row.location,
      isActive: Boolean(row.isActive),
      items: (row.items || []).map((it) => ({
        label: it.label || '',
        url: it.url || '',
        order: it.order || 0,
        target: it.target || '_self',
        icon: it.icon || '',
      })),
    })
    setFormError('')
    setModalOpen(true)
  }

  const updateItem = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }))
  }

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem(), order: prev.items.length }] }))
  }

  const removeItem = (index) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      items: form.items.map((it, i) => ({ ...it, order: i })),
    }
    try {
      if (editing) {
        await menusApi.update(editing._id, payload)
      } else {
        await menusApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save menu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await menusApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete menu')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'location', header: 'Location', render: (row) => <Badge tone={LOCATION_TONES[row.location]}>{row.location}</Badge> },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    { key: 'items', header: 'Items', render: (row) => (row.items || []).length },
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
        title="Menus"
        description="Manage site navigation menus."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New menu
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No menus yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit menu' : 'New menu'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              {MENU_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
          </div>
          <Checkbox label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#8B93A7]">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/5"
              >
                <FiPlus size={14} /> Add item
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-white/10 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="Label"
                      value={item.label}
                      onChange={(e) => updateItem(index, { label: e.target.value })}
                    />
                    <TextInput
                      label="URL"
                      value={item.url}
                      onChange={(e) => updateItem(index, { url: e.target.value })}
                    />
                    <Select
                      label="Target"
                      value={item.target}
                      onChange={(e) => updateItem(index, { target: e.target.value })}
                    >
                      {MENU_TARGETS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                    <TextInput
                      label="Icon"
                      value={item.icon}
                      onChange={(e) => updateItem(index, { icon: e.target.value })}
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {form.items.length === 0 && <p className="text-sm text-[#5B6478]">No items yet.</p>}
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
        title="Delete menu"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
