import { motion } from 'framer-motion'
import { FiHelpCircle, FiCheck } from 'react-icons/fi'

const bubbles = [
  { from: 'user', text: 'Do you offer ongoing support?', delay: 0.2 },
  { from: 'bd', text: 'Yes — most clients choose a monthly retainer.', delay: 1.2 },
  { from: 'user', text: 'How fast can we launch?', delay: 2.4 },
  { from: 'bd', text: 'Most projects go live within 4–6 weeks.', delay: 3.4 },
]

export default function FAQChatGraphic() {
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[420px]">
      <div
        className="absolute h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #22D3D9 0%, transparent 70%)' }}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#141928] p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2 text-[#8B93A7]">
          <FiHelpCircle className="text-[#22D3D9]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Live Q&A</span>
        </div>
        <div className="space-y-3">
          {bubbles.map((bubble, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0] }}
              transition={{ duration: 5.4, repeat: Infinity, delay: bubble.delay, times: [0, 0.12, 0.85, 1] }}
              className={`flex ${bubble.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[85%] items-center gap-2 rounded-2xl px-4 py-2.5 text-sm ${
                  bubble.from === 'user' ? 'bg-[#05B0BA] text-white' : 'bg-[#0B0E14] text-slate-200 border border-white/10'
                }`}
              >
                {bubble.from === 'bd' && <FiCheck className="shrink-0 text-[#22D3D9]" size={14} />}
                {bubble.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
