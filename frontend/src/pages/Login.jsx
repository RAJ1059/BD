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
    <div className="flex min-h-[80vh] items-center justify-center bg-[#09090B] px-4 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111115] p-10 text-center shadow-sm">
        <img src={logo} alt="Business Directions" className="mx-auto h-10 w-auto" />

        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A050F8] to-[#FF7439] text-white shadow-[0_0_30px_rgba(160,80,248,0.35)]">
          <FiLock size={22} />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-white">Client &amp; Team Login</h1>
        <p className="mt-3 text-sm leading-7 text-[#9898A6]">
          Sign in to track projects, invoices, and reports.
        </p>

        <div className="mt-8">
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setError} text="signin_with" />
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-[#6B6B78]">
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
            <label htmlFor="email" className="block text-sm font-medium text-[#9898A6]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-white outline-none focus:border-[#A050F8]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#9898A6]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-white outline-none focus:border-[#A050F8]"
            />
          </div>

          {needsTwoFactor && (
            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-[#9898A6]">
                Two-factor code
              </label>
              <input
                id="twoFactorCode"
                type="text"
                inputMode="numeric"
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-white outline-none focus:border-[#A050F8]"
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-[#9898A6]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-[#09090B]"
            />
            Remember me
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#A050F8] px-6 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-wide text-[#6B6B78]">
          <span className="h-px flex-1 bg-white/10" />
          new here
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Link
          to="/register"
          className="mt-4 block w-full rounded-full border border-[#A050F8] px-6 py-3 text-center font-semibold text-[#A050F8] transition hover:bg-[#A050F8] hover:text-white"
        >
          Register
        </Link>
      </div>
    </div>
  )
}
