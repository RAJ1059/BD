import { FiX } from 'react-icons/fi'

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10">
      <div className={`w-full ${width} rounded-2xl border border-white/10 bg-[#111115] shadow-xl`}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-[#9898A6] transition hover:text-white">
            <FiX size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
