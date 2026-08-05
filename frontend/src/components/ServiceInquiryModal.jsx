import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiSearch, FiTarget, FiShare2, FiCode, FiBriefcase,
  FiUser, FiMail, FiPhone, FiMessageSquare, FiCheckCircle, FiArrowLeft, FiArrowRight,
} from 'react-icons/fi'
import { api } from '../lib/api'

const goals = [
  { key: 'SEO & Visibility', icon: FiSearch },
  { key: 'Paid Ads (PPC)', icon: FiTarget },
  { key: 'Social Media', icon: FiShare2 },
  { key: 'Web & App Development', icon: FiCode },
  { key: 'Something else', icon: FiBriefcase },
]

const STEPS = ['service', 'name', 'email', 'phone', 'message']

export default function ServiceInquiryModal({ isOpen, onClose }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState({ service: '', name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const reset = () => {
    setStepIndex(0)
    setForm({ service: '', name: '', email: '', phone: '', message: '' })
    setStatus('idle')
    setError('')
  }

  const handleClose = () => {
    onClose()
    setTimeout(reset, 300)
  }

  const selectService = (key) => {
    setForm((prev) => ({ ...prev, service: key }))
    setStepIndex(1)
  }

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))

  const isStepValid = () => {
    if (currentStep === 'name') return form.name.trim().length > 0
    if (currentStep === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    if (currentStep === 'phone') return form.phone.trim().length > 0
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      await api.post('/public/contact', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        service: form.service,
        message: form.message,
      })
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const currentStep = STEPS[stepIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-[#141928] p-8 shadow-2xl"
        >
          <button
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-[#8B93A7] transition hover:text-white"
          >
            <FiX size={20} />
          </button>

          {status === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex min-h-[320px] flex-col items-center justify-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white">
                <FiCheckCircle size={28} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">Thanks, {form.name.split(' ')[0]}!</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[#8B93A7]">
                We've received your project details. A Business Direction expert will reach out within 24 business hours.
              </p>
              <button
                onClick={handleClose}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <>
              <span className="inline-flex items-center rounded-full bg-[#05B0BA]/15 px-4 py-1.5 text-xs font-semibold text-[#05B0BA]">
                Free · no commitment
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-white">
                Let's talk about your project<span className="text-[#22D3D9]">.</span>
              </h2>
              <p className="mt-2 text-sm text-[#8B93A7]">A Business Direction expert replies within 24 business hours.</p>

              <div className="mt-5 flex gap-1.5">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      i === stepIndex ? 'w-8 bg-[#05B0BA]' : i < stepIndex ? 'w-1.5 bg-[#05B0BA]' : 'w-1.5 bg-white/15'
                    }`}
                  />
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 'service' && (
                    <motion.div key="service" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <p className="mt-6 text-lg font-semibold text-white">What service are you looking for?</p>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {goals.map((g) => {
                          const Icon = g.icon
                          return (
                            <button
                              type="button"
                              key={g.key}
                              onClick={() => selectService(g.key)}
                              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm font-semibold text-white transition hover:border-[#05B0BA] hover:bg-[#05B0BA]/10"
                            >
                              <Icon className="text-[#05B0BA]" size={18} />
                              {g.key}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'name' && (
                    <motion.div key="name" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <p className="mt-6 text-lg font-semibold text-white">What's your name?</p>
                      <div className="relative mt-4">
                        <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6478]" size={16} />
                        <input
                          autoFocus
                          required
                          value={form.name}
                          onChange={update('name')}
                          placeholder="Full name"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'email' && (
                    <motion.div key="email" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <p className="mt-6 text-lg font-semibold text-white">What's your email?</p>
                      <div className="relative mt-4">
                        <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6478]" size={16} />
                        <input
                          autoFocus
                          type="email"
                          required
                          value={form.email}
                          onChange={update('email')}
                          placeholder="Work email"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'phone' && (
                    <motion.div key="phone" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <p className="mt-6 text-lg font-semibold text-white">What's your phone number?</p>
                      <div className="relative mt-4">
                        <FiPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6478]" size={16} />
                        <input
                          autoFocus
                          type="tel"
                          required
                          value={form.phone}
                          onChange={update('phone')}
                          placeholder="Phone number"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'message' && (
                    <motion.div key="message" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                      <p className="mt-6 text-lg font-semibold text-white">Tell us about your project.</p>
                      <div className="relative mt-4">
                        <FiMessageSquare className="pointer-events-none absolute left-4 top-4 text-[#5B6478]" size={16} />
                        <textarea
                          autoFocus
                          required
                          value={form.message}
                          onChange={update('message')}
                          placeholder="What are you trying to achieve?"
                          className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#5B6478] focus:border-[#05B0BA]"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

                {currentStep !== 'service' && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                    >
                      <FiArrowLeft size={14} /> Back
                    </button>
                    {currentStep === 'message' ? (
                      <button
                        key="submit-btn"
                        type="submit"
                        disabled={status === 'submitting'}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#05B0BA] to-[#22D3D9] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-70"
                      >
                        {status === 'submitting' ? 'Submitting…' : 'Submit'}
                      </button>
                    ) : (
                      <button
                        key="continue-btn"
                        type="button"
                        onClick={goNext}
                        disabled={!isStepValid()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#05B0BA] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                      >
                        Continue <FiArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )}
              </form>

              <p className="mt-6 text-center text-xs text-[#5B6478]">Your data stays confidential.</p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
