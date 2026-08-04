import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'

const cards = [
  { title: 'Northstar Health', tag: 'SEO + Web', color: '#05B0BA', rotate: -8, x: -60, y: -20, delay: 0 },
  { title: 'Aurelia Capital', tag: 'PPC + Analytics', color: '#22D3D9', rotate: 4, x: 40, y: -50, delay: 0.15 },
  { title: 'Lumen Retail', tag: 'Ecommerce Growth', color: '#0891A0', rotate: -4, x: 10, y: 40, delay: 0.3 },
]

export default function PortfolioStackGraphic() {
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[420px]">
      <div
        className="absolute h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #22D3D9 0%, transparent 70%)' }}
      />
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.85, rotate: card.rotate, x: card.x, y: card.y }}
          animate={{ opacity: 1, scale: 1, rotate: card.rotate, x: card.x, y: [card.y, card.y - 12, card.y] }}
          transition={{
            opacity: { duration: 0.5, delay: card.delay },
            scale: { duration: 0.5, delay: card.delay },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: card.delay },
          }}
          className="absolute w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#141928] shadow-xl"
          style={{ zIndex: cards.length - i }}
        >
          <div className="h-28 w-full" style={{ background: `linear-gradient(135deg, ${card.color}55, #0B0E14)` }} />
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: card.color }}>{card.tag}</p>
              <p className="mt-1 text-sm font-semibold text-white">{card.title}</p>
            </div>
            <FiArrowUpRight className="text-white/70" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
