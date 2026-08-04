import { useEffect, useState } from 'react'
import { FiFile } from 'react-icons/fi'
import Modal from './Modal'
import { mediaApi } from '../../api/media'
import { ApiError } from '../../lib/api'

export default function MediaPickerModal({ open, onClose, onSelect }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError('')
    mediaApi
      .list({ limit: 60 })
      .then((res) => setRows(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load media'))
      .finally(() => setLoading(false))
  }, [open])

  return (
    <Modal open={open} onClose={onClose} title="Select media" width="max-w-3xl">
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-[#8B93A7]">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-[#5B6478]">No media uploaded yet. Upload files from the Media Library first.</p>
      ) : (
        <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {rows.map((item) => (
            <button
              key={item._id}
              onClick={() => onSelect(item)}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0E14] text-left transition hover:border-[#05B0BA]"
            >
              <div className="flex aspect-square items-center justify-center">
                {item.type === 'image' ? (
                  <img src={item.thumbnailUrl || item.url} alt={item.originalName} className="h-full w-full object-cover" />
                ) : (
                  <FiFile size={24} className="text-[#5B6478]" />
                )}
              </div>
              <p className="truncate px-2 py-1 text-xs text-[#E4E4E7]">{item.originalName}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
