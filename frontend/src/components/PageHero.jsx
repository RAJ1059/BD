import { motion } from 'framer-motion'
import HeroGraphic from './HeroGraphic'

export default function PageHero({ eyebrow, title, description, children, graphic }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#09090B] via-[#111115] to-[#0d1f3a] py-24 text-white">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top right, #FF7439 0%, transparent 40%)' }} />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at bottom left, #A050F8 0%, transparent 45%)' }} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FF7439]">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h1>
          {description && <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>}
          {children}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="hidden lg:block"
        >
          {graphic || <HeroGraphic />}
        </motion.div>
      </div>
    </section>
  )
}
