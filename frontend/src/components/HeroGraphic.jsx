import { motion } from 'framer-motion'
import { FiTrendingUp, FiBarChart2, FiGlobe, FiZap } from 'react-icons/fi'

const cards = [
  { icon: FiTrendingUp, label: 'Growth', value: '+142%', color: '#FF7439', className: 'left-2 top-6', delay: 0 },
  { icon: FiBarChart2, label: 'ROI', value: '12x', color: '#A050F8', className: 'right-0 top-24', delay: 0.15 },
  { icon: FiGlobe, label: 'Reach', value: '48 mkts', color: '#FF5C35', className: 'left-8 bottom-8', delay: 0.3 },
  { icon: FiZap, label: 'Speed', value: '3.2x', color: '#A050F8', className: 'right-6 bottom-0', delay: 0.45 },
]

export default function HeroGraphic() {
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[420px]">
      <div
        className="absolute h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A050F8 0%, transparent 70%)', animation: 'sun-pulse 4s ease-in-out infinite' }}
      />
      <div
        className="absolute h-56 w-56 translate-x-16 translate-y-10 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #FF7439 0%, transparent 70%)' }}
      />

      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#A050F8] to-[#FF7439] text-white shadow-xl">
        <span className="text-lg font-bold">BD</span>
      </div>

      {cards.map((card) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.5, delay: card.delay }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: card.delay } }}
            className={`absolute flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111115]/90 px-4 py-3 shadow-lg backdrop-blur ${card.className}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${card.color}1A` }}>
              <Icon size={16} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#9898A6]">{card.label}</p>
              <p className="text-sm font-semibold text-white">{card.value}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
