export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#9898A6]">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-full bg-[#A050F8] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 ${className}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  )
}

export function Banner({ tone = 'error', children }) {
  const toneClass = tone === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  return <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>{children}</div>
}
