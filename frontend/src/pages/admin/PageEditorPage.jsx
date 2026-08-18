import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiSave, FiUploadCloud, FiImage } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import { TextInput, TextArea, Select } from '../../components/admin/FormField'
import RichTextEditor from '../../components/admin/RichTextEditor'
import MediaPickerModal from '../../components/admin/MediaPickerModal'
import { pagesApi } from '../../api/pages'
import { ApiError } from '../../lib/api'

const emptyForm = {
  title: '',
  content: '',
  template: 'default',
  featuredImage: null,
  status: 'draft',
  scheduledAt: '',
  seo: { metaTitle: '', metaDescription: '', focusKeyword: '', canonicalUrl: '', schemaMarkup: '' },
}

export default function PageEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const loadPage = useCallback(async () => {
    if (isNew) return
    setLoading(true)
    setError('')
    try {
      const res = await pagesApi.get(id)
      const page = res.data
      setForm({
        title: page.title,
        content: page.content || '',
        template: page.template || 'default',
        featuredImage: page.featuredImage || null,
        status: page.status,
        scheduledAt: page.scheduledAt ? page.scheduledAt.slice(0, 16) : '',
        seo: {
          metaTitle: page.seo?.metaTitle || '',
          metaDescription: page.seo?.metaDescription || '',
          focusKeyword: page.seo?.focusKeyword || '',
          canonicalUrl: page.seo?.canonicalUrl || '',
          schemaMarkup: page.seo?.schemaMarkup || '',
        },
      })
      const revRes = await pagesApi.revisions(id)
      setRevisions(revRes.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load page')
    } finally {
      setLoading(false)
    }
  }, [id, isNew])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const buildPayload = () => ({
    title: form.title,
    content: form.content,
    template: form.template,
    featuredImage: form.featuredImage?._id || undefined,
    status: form.status,
    scheduledAt: form.status === 'scheduled' ? form.scheduledAt || undefined : undefined,
    seo: form.seo,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (isNew) {
        const res = await pagesApi.create(buildPayload())
        setSuccess('Page created')
        navigate(`/admin/pages/${res.data._id}`, { replace: true })
      } else {
        await pagesApi.update(id, buildPayload())
        setSuccess('Page saved')
        await loadPage()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    setError('')
    try {
      await pagesApi.publish(id)
      setSuccess('Page published')
      await loadPage()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish page')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[#8B93A7]">Loading...</p>

  return (
    <div>
      <PageHeader
        title={isNew ? 'New page' : 'Edit page'}
        actions={
          <div className="flex gap-3">
            <SecondaryButton type="button" onClick={() => navigate('/admin/pages')}>
              Back
            </SecondaryButton>
            {!isNew && form.status !== 'published' && (
              <SecondaryButton type="button" onClick={handlePublish} disabled={saving}>
                <FiUploadCloud /> Publish now
              </SecondaryButton>
            )}
          </div>
        }
      />
      {error && <Banner>{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TextInput label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextInput label="Template" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} hint="Frontend layout used to render this page" />
          <RichTextEditor
            label="Content"
            required
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />

          <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">SEO</h3>
            <div className="space-y-4">
              <TextInput
                label="Meta title"
                value={form.seo.metaTitle}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
              />
              <TextArea
                label="Meta description"
                rows={2}
                value={form.seo.metaDescription}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Focus keyword"
                  value={form.seo.focusKeyword}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, focusKeyword: e.target.value } })}
                />
                <TextInput
                  label="Canonical URL"
                  value={form.seo.canonicalUrl}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, canonicalUrl: e.target.value } })}
                />
              </div>
              <TextArea
                label="Schema markup (JSON-LD)"
                rows={4}
                value={form.seo.schemaMarkup}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, schemaMarkup: e.target.value } })}
              />
            </div>
          </div>

          {!isNew && revisions.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">Revision history</h3>
              <ul className="space-y-2 text-sm">
                {revisions
                  .slice()
                  .reverse()
                  .map((rev, i) => (
                    <li key={i} className="flex items-center justify-between text-[#8B93A7]">
                      <span className="truncate text-[#E4E4E7]">{rev.title}</span>
                      <span className="text-xs">
                        {rev.editedBy?.name || 'Unknown'} · {new Date(rev.editedAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Publishing</h3>
            <div className="space-y-4">
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              {form.status === 'scheduled' && (
                <TextInput
                  label="Scheduled at"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Featured image</h3>
            {form.featuredImage ? (
              <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                <img src={form.featuredImage.thumbnailUrl || form.featuredImage.url} alt="" className="h-32 w-full object-cover" />
              </div>
            ) : (
              <div className="mb-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-[#5B6478]">
                <FiImage size={24} />
              </div>
            )}
            <SecondaryButton type="button" onClick={() => setPickerOpen(true)} className="w-full justify-center">
              Choose image
            </SecondaryButton>
          </div>

          <PrimaryButton type="submit" disabled={saving} className="w-full justify-center">
            <FiSave /> {saving ? 'Saving...' : 'Save'}
          </PrimaryButton>
        </div>
      </form>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) => {
          setForm({ ...form, featuredImage: media })
          setPickerOpen(false)
        }}
      />
    </div>
  )
}
