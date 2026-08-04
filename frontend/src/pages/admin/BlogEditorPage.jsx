import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiSave, FiUploadCloud, FiImage } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import { TextInput, TextArea, Select, Checkbox } from '../../components/admin/FormField'
import RichTextEditor from '../../components/admin/RichTextEditor'
import Badge from '../../components/admin/Badge'
import MediaPickerModal from '../../components/admin/MediaPickerModal'
import { blogsApi } from '../../api/blogs'
import { categoriesApi } from '../../api/categories'
import { tagsApi } from '../../api/tags'
import { ApiError } from '../../lib/api'

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: [],
  featuredImage: null,
  status: 'draft',
  scheduledAt: '',
  isFeatured: false,
  seo: { metaTitle: '', metaDescription: '', focusKeyword: '', canonicalUrl: '' },
}

export default function BlogEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [revisions, setRevisions] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data)).catch(() => {})
    tagsApi.list().then((res) => setTags(res.data)).catch(() => {})
  }, [])

  const loadBlog = useCallback(async () => {
    if (isNew) return
    setLoading(true)
    setError('')
    try {
      const res = await blogsApi.get(id)
      const blog = res.data
      setForm({
        title: blog.title,
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        category: blog.category?._id || '',
        tags: (blog.tags || []).map((t) => t._id),
        featuredImage: blog.featuredImage || null,
        status: blog.status,
        scheduledAt: blog.scheduledAt ? blog.scheduledAt.slice(0, 16) : '',
        isFeatured: blog.isFeatured || false,
        seo: {
          metaTitle: blog.seo?.metaTitle || '',
          metaDescription: blog.seo?.metaDescription || '',
          focusKeyword: blog.seo?.focusKeyword || '',
          canonicalUrl: blog.seo?.canonicalUrl || '',
        },
      })
      setComments(blog.comments || [])
      const revRes = await blogsApi.revisions(id)
      setRevisions(revRes.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }, [id, isNew])

  useEffect(() => {
    loadBlog()
  }, [loadBlog])

  const toggleTag = (tagId) => {
    setForm((f) => ({ ...f, tags: f.tags.includes(tagId) ? f.tags.filter((t) => t !== tagId) : [...f.tags, tagId] }))
  }

  const buildPayload = () => ({
    title: form.title,
    excerpt: form.excerpt,
    content: form.content,
    category: form.category || undefined,
    tags: form.tags,
    featuredImage: form.featuredImage?._id || undefined,
    status: form.status,
    scheduledAt: form.status === 'scheduled' ? form.scheduledAt || undefined : undefined,
    isFeatured: form.isFeatured,
    seo: form.seo,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (isNew) {
        const res = await blogsApi.create(buildPayload())
        setSuccess('Blog post created')
        navigate(`/admin/blogs/${res.data._id}`, { replace: true })
      } else {
        await blogsApi.update(id, buildPayload())
        setSuccess('Blog post saved')
        await loadBlog()
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    setError('')
    try {
      await blogsApi.publish(id)
      setSuccess('Blog post published')
      await loadBlog()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleModerate = async (commentId, approved) => {
    try {
      await blogsApi.moderateComment(id, commentId, approved)
      setComments((cs) => cs.map((c) => (c._id === commentId ? { ...c, approved } : c)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to moderate comment')
    }
  }

  if (loading) return <p className="text-[#8B93A7]">Loading...</p>

  return (
    <div>
      <PageHeader
        title={isNew ? 'New blog post' : 'Edit blog post'}
        actions={
          <div className="flex gap-3">
            <SecondaryButton type="button" onClick={() => navigate('/admin/blogs')}>
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
          <TextArea label="Excerpt" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
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

          {!isNew && (
            <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
              <h3 className="mb-4 text-sm font-semibold text-white">Comments</h3>
              {comments.length === 0 ? (
                <p className="text-sm text-[#5B6478]">No comments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c._id} className="rounded-xl border border-white/10 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{c.name}</span>
                        <Badge tone={c.approved ? 'green' : 'neutral'}>{c.approved ? 'Approved' : 'Pending'}</Badge>
                      </div>
                      <p className="mt-1 text-[#8B93A7]">{c.message}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => handleModerate(c._id, true)} className="text-xs font-semibold text-emerald-400">
                          Approve
                        </button>
                        <button onClick={() => handleModerate(c._id, false)} className="text-xs font-semibold text-red-400">
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
              <Checkbox label="Featured post" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
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

          <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Category</h3>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => toggleTag(t._id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    form.tags.includes(t._id) ? 'bg-[#05B0BA] text-white' : 'bg-white/5 text-[#8B93A7] hover:bg-white/10'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
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
