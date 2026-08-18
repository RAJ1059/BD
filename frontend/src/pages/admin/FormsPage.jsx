import { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiList } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { TextInput, TextArea, Select, Checkbox } from '../../components/admin/FormField'
import { formsApi } from '../../api/forms'
import { ApiError } from '../../lib/api'

const FORM_FIELD_TYPES = ['text', 'textarea', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'date', 'file']

const emptyField = () => ({ label: '', name: '', type: 'text', required: false, options: [], placeholder: '', order: 0 })

const emptyForm = {
  name: '',
  description: '',
  isActive: true,
  allowFileUpload: false,
  successMessage: '',
  notificationEmails: '',
  fields: [],
}

export default function FormsPage() {
  const navigate = useNavigate()
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
      const res = await formsApi.list()
      setRows(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load forms')
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
      description: row.description || '',
      isActive: Boolean(row.isActive),
      allowFileUpload: Boolean(row.allowFileUpload),
      successMessage: row.successMessage || '',
      notificationEmails: (row.notificationEmails || []).join(', '),
      fields: (row.fields || []).map((f) => ({
        label: f.label || '',
        name: f.name || '',
        type: f.type || 'text',
        required: Boolean(f.required),
        options: f.options || [],
        placeholder: f.placeholder || '',
        order: f.order || 0,
      })),
    })
    setFormError('')
    setModalOpen(true)
  }

  const updateField = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }))
  }

  const addField = () => {
    setForm((prev) => ({ ...prev, fields: [...prev.fields, { ...emptyField(), order: prev.fields.length }] }))
  }

  const removeField = (index) => {
    setForm((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      notificationEmails: form.notificationEmails
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      fields: form.fields.map((f, i) => ({
        ...f,
        order: i,
        options:
          typeof f.options === 'string'
            ? f.options
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean)
            : f.options,
      })),
    }
    try {
      if (editing) {
        await formsApi.update(editing._id, payload)
      } else {
        await formsApi.create(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save form')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await formsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete form')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <Badge tone={row.isActive ? 'green' : 'neutral'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    { key: 'fields', header: 'Fields', render: (row) => (row.fields || []).length },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/forms/${row._id}/submissions`)}
            title="View submissions"
            className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-white/5 hover:text-white"
          >
            <FiList size={16} />
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
        title="Forms"
        description="Manage lead-capture forms and their fields."
        actions={
          <PrimaryButton onClick={openCreate}>
            <FiPlus /> New form
          </PrimaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}

      <DataTable columns={columns} rows={rows} loading={loading} emptyLabel="No forms yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit form' : 'New form'} width="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextInput label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-6">
            <Checkbox
              label="Active"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <Checkbox
              label="Allow file upload"
              checked={form.allowFileUpload}
              onChange={(e) => setForm({ ...form, allowFileUpload: e.target.checked })}
            />
          </div>
          <TextArea
            label="Success message"
            value={form.successMessage}
            onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
          />
          <TextInput
            label="Notification emails"
            hint="Comma-separated"
            value={form.notificationEmails}
            onChange={(e) => setForm({ ...form, notificationEmails: e.target.value })}
          />

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#8B93A7]">Fields</label>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/5"
              >
                <FiPlus size={14} /> Add field
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {form.fields.map((field, index) => (
                <div key={index} className="rounded-xl border border-white/10 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="Label"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                    />
                    <TextInput
                      label="Name"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                    />
                    <Select
                      label="Type"
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value })}
                    >
                      {FORM_FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                    <TextInput
                      label="Options"
                      hint="Comma-separated, for select/checkbox/radio"
                      value={Array.isArray(field.options) ? field.options.join(', ') : field.options}
                      onChange={(e) => updateField(index, { options: e.target.value })}
                    />
                    <TextInput
                      label="Placeholder"
                      value={field.placeholder}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    />
                    <div className="flex items-end justify-between">
                      <Checkbox
                        label="Required"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                      />
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {form.fields.length === 0 && <p className="text-sm text-[#5B6478]">No fields yet.</p>}
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
        title="Delete form"
        description={`Delete "${deleteTarget?.name}"? This can't be undone.`}
      />
    </div>
  )
}
