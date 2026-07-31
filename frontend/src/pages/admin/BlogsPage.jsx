import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import PageHeader, { PrimaryButton, Banner } from '../../components/admin/PageHeader'
import DataTable from '../../components/admin/DataTable'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Badge from '../../components/admin/Badge'
import { blogsApi } from '../../api/blogs'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ApiError } from '../../lib/api'

const STATUS_TONES = { draft: 'neutral', scheduled: 'orange', published: 'green', archived: 'red' }

export default function BlogsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await blogsApi.list({ page, limit: 20, search: debouncedSearch || undefined })
      setRows(res.data)
      setTotalPages(res.meta?.totalPages || 1)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await blogsApi.remove(deleteTarget._id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete blog post')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={STATUS_TONES[row.status]}>{row.status}</Badge> },
    { key: 'author', header: 'Author', render: (row) => row.author?.name || '—' },
    { key: 'category', header: 'Category', render: (row) => row.category?.name || '—' },
    { key: 'publishedAt', header: 'Published', render: (row) => (row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : '—') },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/blogs/${row._id}`)}
            className="rounded-lg p-2 text-[#9898A6] transition hover:bg-white/5 hover:text-white"
          >
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-2 text-[#9898A6] transition hover:bg-red-500/10 hover:text-red-400">
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Manage blog content, SEO metadata, and comments."
        actions={
          <PrimaryButton onClick={() => navigate('/admin/blogs/new')}>
            <FiPlus /> New post
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
        searchPlaceholder="Search posts..."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyLabel="No blog posts yet."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete blog post"
        description={`Delete "${deleteTarget?.title}"? This can't be undone.`}
      />
    </div>
  )
}
