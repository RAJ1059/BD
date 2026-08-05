import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiMenu, FiX, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiLock, FiZap } from 'react-icons/fi'
import { useState } from 'react'
import FloatingSocial from './FloatingSocial'
import ServiceInquiryModal from './ServiceInquiryModal'
import logo from '../assets/logo.png'

const primaryNav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/blog', label: 'Blog' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0E14]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Business Directions" className="h-9 w-auto sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-[#05B0BA]' : 'text-[#8B93A7] hover:text-[#05B0BA]'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <button
              onClick={() => setQuoteOpen(true)}
              className="whitespace-nowrap rounded-full bg-[#22D3D9] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#05B0BA]"
            >
              Talk to Experts
            </button>
            <Link
              to="/contact"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#22D3D9] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#05B0BA]"
            >
              Book a Strategy Call
            </Link>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition ${isActive ? 'text-[#05B0BA]' : 'text-[#8B93A7] hover:text-[#05B0BA]'}`
              }
            >
              <FiLock size={14} /> Login
            </NavLink>
          </div>
          <button className="rounded-full border border-white/20 p-2 lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 bg-[#141928] lg:hidden"
            >
              <div className="flex flex-col gap-2 px-4 py-4">
                {primaryNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#05B0BA]/10 text-[#05B0BA]' : 'text-white'}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => { setOpen(false); setQuoteOpen(true) }}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#22D3D9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#05B0BA]"
                >
                  <FiZap size={14} /> Talk to Experts
                </button>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#22D3D9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#05B0BA]" onClick={() => setOpen(false)}>
                  Book a Strategy Call <FiArrowRight />
                </Link>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#05B0BA]/10 text-[#05B0BA]' : 'text-white'}`
                  }
                  onClick={() => setOpen(false)}
                >
                  <FiLock size={14} /> Login
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <FloatingSocial />

      <ServiceInquiryModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />

      <footer className="border-t border-white/10 bg-[#0B0E14] text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-[32px] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div>
              <h3 className="text-2xl font-semibold text-white">Stay ahead of the growth curve.</h3>
              <p className="mt-2 text-sm leading-7 text-[#5B6478]">Get monthly insights on SEO, paid media, and digital strategy — no fluff, just what's working now.</p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Your work email"
                className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white outline-none placeholder:text-[#5B6478] focus:border-[#22D3D9]"
              />
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
                Subscribe <FiArrowRight />
              </button>
            </form>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-4">
            <div>
              <img src={logo} alt="Business Directions" className="h-10 w-auto" />
              <p className="mt-4 text-sm leading-7 text-[#5B6478]">
                Helping ambitious brands grow through premium digital strategy, design, and performance marketing.
              </p>
              <div className="mt-5 flex gap-3">
                {[FiFacebook, FiTwitter, FiLinkedin, FiInstagram].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-[#22D3D9] hover:text-[#22D3D9]">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5B6478]">Services</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-white">SEO & Local SEO</Link></li>
                <li><Link to="/services" className="hover:text-white">Google Ads (PPC)</Link></li>
                <li><Link to="/services" className="hover:text-white">Web & App Development</Link></li>
                <li><Link to="/services" className="hover:text-white">Branding & Design</Link></li>
                <li><Link to="/services" className="hover:text-white">Marketing Automation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5B6478]">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/portfolio" className="hover:text-white">Portfolio</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5B6478]">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>hello@businessdirection.com</li>
                <li>+1 (415) 555-1040</li>
                <li>210 Market Street, San Francisco, CA</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#5B6478] sm:flex-row">
            <p>© 2026 Business Direction. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
