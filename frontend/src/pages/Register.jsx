import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUserPlus } from 'react-icons/fi'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import GoogleAuthButton from '../components/GoogleAuthButton'

export default function Register() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const goToDashboard = (user) => {
    navigate(user.role?.name === 'Client' ? '/client' : '/admin', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      const result = await register(name, email, password)
      goToDashboard(result.user)
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
      goToDashboard(result.user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign-in failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0B0E14] px-4 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#141928] p-10 text-center shadow-sm">
        <img src={logo} alt="Business Directions" className="mx-auto h-10 w-auto" />

        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05B0BA] to-[#22D3D9] text-white shadow-[0_0_30px_rgba(5, 176, 186,0.35)]">
          <FiUserPlus size={22} />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-white">Create your client account</h1>
        <p className="mt-3 text-sm leading-7 text-[#8B93A7]">
          Register to track your projects, invoices, and reports.
        </p>

        <div className="mt-8">
          <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setError} text="signup_with" />
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
            <label htmlFor="name" className="block text-sm font-medium text-[#8B93A7]">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-white outline-none focus:border-[#05B0BA]"
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-white outline-none focus:border-[#05B0BA]"
            />
            <p className="mt-1 text-xs text-[#5B6478]">At least 8 characters, with upper, lower, and a number.</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#8B93A7]">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-4 py-3 text-white outline-none focus:border-[#05B0BA]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#05B0BA] px-6 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#8B93A7]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#05B0BA] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
