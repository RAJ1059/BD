import { motion } from 'framer-motion'
import { FiBookOpen } from 'react-icons/fi'

const lines = [
  { width: '85%', delay: 0 },
  { width: '95%', delay: 0.1 },
  { width: '65%', delay: 0.2 },
  { width: '90%', delay: 0.3 },
  { width: '40%', delay: 0.4 },
]

export default function BlogBrowserGraphic() {
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[420px]">
      <div
        className="absolute h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #05B0BA 0%, transparent 70%)' }}
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#141928] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0891A0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#22D3D9]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#05B0BA]" />
          <div className="ml-2 flex-1 rounded-full bg-[#0B0E14] px-3 py-1 text-[11px] text-[#5B6478]">businessdirection.com/blog</div>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
            <FiBookOpen size={16} />
          </div>
          <div className="space-y-2.5">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ width: '0%', opacity: 0 }}
                animate={{ width: line.width, opacity: 1 }}
                transition={{ duration: 0.8, delay: line.delay, repeat: Infinity, repeatDelay: 3.2, repeatType: 'reverse' }}
                className="h-2.5 rounded-full bg-white/15"
              />
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0891A0] to-[#05B0BA]" />
            <div className="space-y-1">
              <div className="h-2 w-20 rounded-full bg-white/20" />
              <div className="h-2 w-14 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
