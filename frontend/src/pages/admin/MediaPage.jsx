import { useEffect, useState, useCallback, useRef } from 'react'
import { FiUpload, FiTrash2, FiFile } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { Select } from '../../components/admin/FormField'
import { mediaApi } from '../../api/media'
import { ApiError } from '../../lib/api'

export default function MediaPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await mediaApi.list({ page, limit: 30, type: typeFilter || undefined })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await mediaApi.upload(file)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await mediaApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete file')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload and manage images and files used across the site."
        actions={
          <>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            <PrimaryButton type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <FiUpload /> {uploading ? 'Uploading...' : 'Upload file'}
            </PrimaryButton>
          </>
        }
      />
      {error && <Banner>{error}</Banner>}

      <div className="mb-4 flex items-center gap-3">
        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="w-48"
        >
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="other">Other</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-[#9898A6]">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111115] p-10 text-center text-[#6B6B78]">No media uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {rows.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111115]">
              <div className="flex aspect-square items-center justify-center bg-[#09090B]">
                {item.type === 'image' ? (
                  <img src={item.thumbnailUrl || item.url} alt={item.originalName} className="h-full w-full object-cover" />
                ) : (
                  <FiFile size={32} className="text-[#6B6B78]" />
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-[#E4E4E7]" title={item.originalName}>
                  {item.originalName}
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(item)}
                className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500/80"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-[#9898A6]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete file"
        description={`Delete "${deleteTarget?.originalName}"? This can't be undone.`}
      />
    </div>
  )
}
