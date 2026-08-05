import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLock, FiCheckCircle, FiShield, FiTrendingUp, FiArrowLeft } from 'react-icons/fi'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import GoogleAuthButton from '../components/GoogleAuthButton'

const highlights = [
  { icon: FiTrendingUp, text: 'Live project and campaign performance' },
  { icon: FiShield, text: 'Secure, role-based access for your team' },
  { icon: FiCheckCircle, text: 'Transparent reporting, always up to date' },
]

export default function Login() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email, password, rememberMe, needsTwoFactor ? twoFactorCode : undefined)
      if (result.twoFactorRequired) {
        setNeedsTwoFactor(true)
        return
      }
      navigate(result.user.role?.name === 'Client' ? '/client' : '/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (idToken) => {
    setError('')
    try {
      const result = await googleLogin(idToken)
      navigate(result.user.role?.name === 'Client' ? '/client' : '/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign-in failed. Please try again.')
    }
  }

  return (
    <div className="relative grid min-h-screen bg-[#0B0E14] lg:grid-cols-2">
      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#8B93A7] backdrop-blur transition hover:border-[#05B0BA] hover:text-[#05B0BA] sm:left-6 sm:top-6"
      >
        <FiArrowLeft size={14} /> Back to website
      </Link>

      {/* Branding panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0B0E14] via-[#0E1420] to-[#141928] lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #05B0BA 0%, transparent 70%)' }}
        />
        <div
          className="absolute -right-16 bottom-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #22D3D9 0%, transparent 70%)' }}
        />
        <div className="orbit-dot-grid absolute inset-0" />

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <img src={logo} alt="Business Directions" className="h-10 w-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10 max-w-md"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">Client &amp; Team Portal</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
            Everything about your growth, in one place.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#8B93A7]">
            Sign in to track projects, campaigns, invoices, and reports — with full visibility into what your team is delivering.
          </p>

          <div className="mt-8 space-y-4">
            {highlights.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 text-sm text-slate-200"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#05B0BA]">
                    <Icon size={15} />
                  </span>
                  {item.text}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
        >
          <p className="text-sm leading-7 text-slate-200">
            &ldquo;Reporting is transparent and the team acts like a true extension of ours.&rdquo;
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#5B6478]">Grace Whitfield · Head of Growth, Crest Labs</p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <img src={logo} alt="Business Directions" className="mx-auto h-10 w-auto lg:hidden" />

          <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white shadow-[0_0_30px_rgba(5,176,186,0.35)] lg:mx-0 lg:mt-0">
            <FiLock size={22} />
          </div>

          <h2 className="mt-6 text-center text-2xl font-semibold text-white lg:text-left">Welcome back</h2>
          <p className="mt-3 text-center text-sm leading-7 text-[#8B93A7] lg:text-left">
            Sign in to your account to continue.
          </p>

          <div className="mt-8">
            <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setError} text="signin_with" />
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-[#5B6478]">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#8B93A7]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#141928] px-4 py-3 text-white outline-none transition focus:border-[#05B0BA] focus:ring-2 focus:ring-[#05B0BA]/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#8B93A7]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#141928] px-4 py-3 text-white outline-none transition focus:border-[#05B0BA] focus:ring-2 focus:ring-[#05B0BA]/20"
              />
            </div>

            <AnimatePresence>
              {needsTwoFactor && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-[#8B93A7]">
                    Two-factor code
                  </label>
                  <input
                    id="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#141928] px-4 py-3 text-white outline-none transition focus:border-[#05B0BA] focus:ring-2 focus:ring-[#05B0BA]/20"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#8B93A7]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-[#141928] accent-[#05B0BA]"
                />
                Remember me
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#05B0BA] px-6 py-3 font-semibold text-white transition disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-[#5B6478]">
            <span className="h-px flex-1 bg-white/10" />
            new here
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <Link
            to="/register"
            className="mt-4 block w-full rounded-full border border-[#05B0BA] px-6 py-3 text-center font-semibold text-[#05B0BA] transition hover:bg-[#05B0BA] hover:text-white"
          >
            Register
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
