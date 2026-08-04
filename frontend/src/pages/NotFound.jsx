import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#0B0E14] px-4 py-20">
      <div className="max-w-xl rounded-[32px] border border-white/10 bg-[#141928] p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#05B0BA]">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-[#8B93A7]">The page you are looking for may have moved or no longer exists.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-[#0B0E14] px-6 py-3 font-semibold text-white">Back to home</Link>
      </div>
    </div>
  )
}
