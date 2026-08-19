import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import { TextInput, TextArea, Select, Checkbox } from '../../components/admin/FormField'
import { servicesApi } from '../../api/services'
import { ApiError } from '../../lib/api'
import { ICON_NAMES } from '../../lib/iconRegistry'

const emptyForm = { title: '', icon: 'FiZap', summary: '', description: '', features: [], benefits: [], isActive: true }

function StringRepeater({ label, items, onChange }) {
  const addItem = () => onChange([...items, ''])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, v) => onChange(items.map((item, idx) => (idx === i ? v : item)))

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#8B93A7]">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/5"
        >
          <FiPlus size={14} /> Add
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white outline-none focus:border-[#05B0BA]"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="rounded-lg p-2 text-[#8B93A7] transition hover:bg-red-500/10 hover:text-red-400"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-[#5B6478]">None yet.</p>}
      </div>
    </div>
  )
}

export default function ServiceContentEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (isNew) return
    setLoading(true)
    setError('')
    try {
      const res = await servicesApi.get(id)
      const s = res.data
      setForm({
        title: s.title,
        icon: s.icon || 'FiZap',
        summary: s.summary || '',
        description: s.description || '',
        features: s.features || [],
        benefits: s.benefits || [],
        isActive: Boolean(s.isActive),
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load service')
    } finally {
      setLoading(false)
    }
  }, [id, isNew])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (isNew) {
        const res = await servicesApi.create(form)
        setSuccess('Service created')
        navigate(`/admin/services-content/${res.data._id}`, { replace: true })
      } else {
        await servicesApi.update(id, form)
        setSuccess('Service saved')
        await load()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[#8B93A7]">Loading...</p>

  return (
    <div>
      <PageHeader
        title={isNew ? 'New service' : 'Edit service'}
        actions={
          <SecondaryButton type="button" onClick={() => navigate('/admin/services-content')}>
            Back
          </SecondaryButton>
        }
      />
      {error && <Banner>{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        <TextInput label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select label="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <TextArea label="Summary" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <TextArea label="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <StringRepeater label="Features" items={form.features} onChange={(features) => setForm({ ...form, features })} />
        <StringRepeater label="Benefits" items={form.benefits} onChange={(benefits) => setForm({ ...form, benefits })} />
        <Checkbox label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />

        <PrimaryButton type="submit" disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save'}
        </PrimaryButton>
      </form>
    </div>
  )
}
