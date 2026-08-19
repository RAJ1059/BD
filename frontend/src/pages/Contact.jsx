import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiBriefcase, FiMessageSquare, FiArrowRight, FiCheckCircle, FiSend } from 'react-icons/fi'
import { api } from '../lib/api'
import { servicesApi } from '../api/services'
import { getIcon } from '../lib/iconRegistry'

const DEFAULT_HERO = {
  eyebrow: 'Contact',
  title: "Let's create your next growth chapter.",
  description: 'Tell us about your goals and a strategist will get back to you within one business day.',
  bullet1: 'Free strategy consultation',
  bullet2: 'Response within 24 hours',
}

const DEFAULT_INFO_ITEMS = [
  { icon: 'FiMail', label: 'Email us', value: 'hello@businessdirection.com' },
  { icon: 'FiPhone', label: 'Call us', value: '+1 (415) 555-1040' },
  { icon: 'FiMapPin', label: 'Visit us', value: '210 Market Street, San Francisco, CA' },
  { icon: 'FiClock', label: 'Working hours', value: 'Mon – Fri, 9:00 AM – 6:00 PM PST' },
]

const DEFAULT_SOCIAL_LINKS = [
  { icon: 'FaFacebookF', label: 'Facebook', href: '#' },
  { icon: 'FaTwitter', label: 'Twitter', href: '#' },
  { icon: 'FaLinkedinIn', label: 'LinkedIn', href: '#' },
  { icon: 'FaInstagram', label: 'Instagram', href: '#' },
  { icon: 'FaWhatsapp', label: 'WhatsApp', href: '#' },
]

const DEFAULT_CTA = {
  eyebrow: 'Prefer a quick call?',
  heading: 'Book a free 30-minute strategy session.',
  description: 'No pressure, no pitch decks — just a candid conversation about your growth goals.',
  buttonText: 'Schedule a call',
  buttonLink: '#',
}

const DEFAULT_SECTIONS = {
  hero: DEFAULT_HERO,
  infoItems: DEFAULT_INFO_ITEMS,
  socialLinks: DEFAULT_SOCIAL_LINKS,
  cta: DEFAULT_CTA,
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

export default function Contact() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [content, setContent] = useState(DEFAULT_SECTIONS)
  const [services, setServices] = useState([])

  useEffect(() => {
    api
      .get('/public/page-content/contact')
      .then((res) => {
        const fetched = res.data?.sections || {}
        setContent((prev) => {
          const next = { ...prev }
          for (const key of Object.keys(fetched)) {
            if (isFilled(fetched[key])) next[key] = fetched[key]
          }
          return next
        })
      })
      .catch(() => {})

    servicesApi
      .list()
      .then((res) => setServices(res.data))
      .catch(() => setServices([]))
  }, [])

  const { hero, infoItems, socialLinks, cta } = content

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      await api.post('/public/contact', form)
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="bg-[#0B0E14]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B0E14] via-[#141928] to-[#0d1f3a] py-24 text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top right, #22D3D9 0%, transparent 40%)' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#22D3D9]">{hero.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">{hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">{hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2"><FiCheckCircle className="text-[#22D3D9]" /> {hero.bullet1}</div>
            <div className="flex items-center gap-2"><FiCheckCircle className="text-[#22D3D9]" /> {hero.bullet2}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-gradient-to-br from-[#141928] to-[#1B2133] p-8 shadow-sm"
          >
            <div>
              <h2 className="text-2xl font-semibold text-white">Get in touch</h2>
              <p className="mt-3 text-sm leading-7 text-[#8B93A7]">
                Prefer to talk directly? Reach out through any channel below — our team responds fast.
              </p>
              <div className="mt-8 space-y-5">
                {infoItems.map((item) => {
                  const Icon = getIcon(item.icon)
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B6478]">{item.label}</p>
                        <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5B6478]">Follow us</p>
              <div className="mt-4 flex gap-3">
                {socialLinks.map((item) => {
                  const Icon = getIcon(item.icon)
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      aria-label={item.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#22D3D9] hover:text-[#22D3D9]"
                    >
                      <Icon size={15} />
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#141928] p-8 shadow-sm sm:p-10"
          >
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
                    <FiCheckCircle size={28} />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">Message sent!</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#8B93A7]">
                    Thanks for reaching out. A member of our team will get back to you within one business day.
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); setError(''); setForm({ name: '', email: '', phone: '', service: '', message: '' }) }}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-semibold text-white">Start a conversation</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="relative">
                      <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6478]" size={16} />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Full name"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA] focus:bg-white/[0.07]"
                      />
                    </div>
                    <div className="relative">
                      <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6478]" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="Work email"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA] focus:bg-white/[0.07]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="relative">
                      <FiPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6478]" size={16} />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone (optional)"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA] focus:bg-white/[0.07]"
                      />
                    </div>
                    <div className="relative">
                      <FiBriefcase className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[#5B6478]" size={16} />
                      <select
                        name="service"
                        value={form.service}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#05B0BA] focus:bg-white/[0.07]"
                      >
                        <option value="" className="bg-[#141928]">Service of interest</option>
                        {services.map((s) => (
                          <option key={s.slug} value={s.title} className="bg-[#141928]">{s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <FiMessageSquare className="pointer-events-none absolute left-4 top-4 text-[#5B6478]" size={16} />
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us about your project"
                      className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA] focus:bg-white/[0.07]"
                    />
                  </div>

                  {error && (
                    <p className="rounded-2xl border border-[#22D3D9]/30 bg-[#22D3D9]/10 px-4 py-3 text-sm text-[#22D3D9]">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] px-6 py-3.5 font-semibold text-white transition hover:scale-[1.01] disabled:opacity-70 sm:w-auto"
                  >
                    {status === 'submitting' ? 'Sending…' : <>Send inquiry <FiSend /></>}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">{cta.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{cta.heading}</h2>
            </div>
            <div className="rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-100">{cta.description}</p>
              <a href={cta.buttonLink} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#0B0E14]">
                {cta.buttonText} <FiArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
