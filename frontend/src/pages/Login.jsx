import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import GoogleAuthButton from '../components/GoogleAuthButton'

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
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0B0E14] px-4 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#141928] p-10 text-center shadow-sm">
        <img src={logo} alt="Business Directions" className="mx-auto h-10 w-auto" />

        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white shadow-[0_0_30px_rgba(5, 176, 186,0.35)]">
          <FiLock size={22} />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-white">Client &amp; Team Login</h1>
        <p className="mt-3 text-sm leading-7 text-[#8B93A7]">
          Sign in to track projects, invoices, and reports.
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
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

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
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-white outline-none focus:border-[#05B0BA]"
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
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-white outline-none focus:border-[#05B0BA]"
            />
          </div>

          {needsTwoFactor && (
            <div>
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
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-white outline-none focus:border-[#05B0BA]"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-[#8B93A7]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-[#0B0E14]"
            />
            Remember me
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#05B0BA] px-6 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
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
      </div>
    </div>
  )
}
