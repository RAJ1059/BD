import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirming }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      {description && <p className="text-sm text-[#8B93A7]">{description}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
        >
          {confirming ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}
