const baseInputClass =
  'mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-2.5 text-sm text-white outline-none focus:border-[#05B0BA]'

export function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-[#8B93A7]">{label}</label>}
      {children}
      {hint && <p className="mt-1 text-xs text-[#5B6478]">{hint}</p>}
    </div>
  )
}

export function TextInput({ label, hint, className = '', ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input {...props} className={`${baseInputClass} ${className}`} />
    </Field>
  )
}

export function TextArea({ label, hint, className = '', rows = 4, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} {...props} className={`${baseInputClass} ${className}`} />
    </Field>
  )
}

export function Select({ label, hint, className = '', children, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <select {...props} className={`${baseInputClass} ${className}`}>
        {children}
      </select>
    </Field>
  )
}

export function Checkbox({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#8B93A7]">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-white/10 bg-[#0B0E14]" />
      {label}
    </label>
  )
}
