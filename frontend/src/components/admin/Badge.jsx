const TONES = {
  neutral: 'bg-white/10 text-[#9898A6]',
  purple: 'bg-[#A050F8]/15 text-[#A050F8]',
  green: 'bg-emerald-500/15 text-emerald-400',
  red: 'bg-red-500/15 text-red-400',
  orange: 'bg-[#FF7439]/15 text-[#FF7439]',
  blue: 'bg-sky-500/15 text-sky-400',
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONES[tone] || TONES.neutral}`}>
      {children}
    </span>
  )
}
