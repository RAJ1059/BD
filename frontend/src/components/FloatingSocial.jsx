import { motion } from 'framer-motion'
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa'

const links = [
  { icon: FaFacebookF, label: 'Facebook', href: '#', color: '#A050F8' },
  { icon: FaInstagram, label: 'Instagram', href: '#', color: '#FF5C35' },
  { icon: FaWhatsapp, label: 'WhatsApp', href: '#', color: '#FF7439' },
]

export default function FloatingSocial() {
  return (
    <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 sm:flex">
      {links.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.a
            key={item.label}
            href={item.href}
            aria-label={item.label}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.1, x: -4 }}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#111115]/90 text-white shadow-lg backdrop-blur transition"
            style={{ '--hover-color': item.color }}
          >
            <Icon size={18} className="transition group-hover:text-[var(--hover-color)]" />
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[#111115] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              {item.label}
            </span>
          </motion.a>
        )
      })}
    </div>
  )
}
