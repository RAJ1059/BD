import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiSave } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import SectionsEditor from '../../components/admin/SectionsEditor'
import { pageContentApi } from '../../api/pageContent'
import { PAGE_CONTENT_SCHEMAS } from '../../config/pageContentSchemas'
import { ApiError } from '../../lib/api'

export default function PageContentEditorPage() {
  const { pageKey } = useParams()
  const navigate = useNavigate()
  const schema = PAGE_CONTENT_SCHEMAS[pageKey]

  const [sections, setSections] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await pageContentApi.get(pageKey)
      setSections(res.data.sections || {})
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load page content')
    } finally {
      setLoading(false)
    }
  }, [pageKey])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await pageContentApi.update(pageKey, { sections })
      setSuccess('Page content saved')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save page content')
    } finally {
      setSaving(false)
    }
  }

  if (!schema) return <p className="text-[#8B93A7]">Unknown page.</p>
  if (loading) return <p className="text-[#8B93A7]">Loading...</p>

  return (
    <div>
      <PageHeader
        title={`Edit ${schema.label}`}
        actions={
          <div className="flex gap-3">
            <SecondaryButton type="button" onClick={() => navigate('/admin/page-content')}>
              Back
            </SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </div>
        }
      />
      {error && <Banner>{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      <form onSubmit={handleSubmit}>
        <SectionsEditor schema={schema} value={sections} onChange={setSections} />
      </form>
    </div>
  )
}
