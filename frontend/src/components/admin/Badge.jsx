const TONES = {
  neutral: 'bg-white/10 text-[#8B93A7]',
  purple: 'bg-[#05B0BA]/15 text-[#05B0BA]',
  green: 'bg-emerald-500/15 text-emerald-400',
  red: 'bg-red-500/15 text-red-400',
  orange: 'bg-[#22D3D9]/15 text-[#22D3D9]',
  blue: 'bg-sky-500/15 text-sky-400',
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONES[tone] || TONES.neutral}`}>
      {children}
    </span>
  )
}
