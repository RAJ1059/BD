import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#09090B] px-4 text-center text-white">
      <h1 className="text-2xl font-semibold">Client Dashboard</h1>
      <p className="text-[#9898A6]">
        Signed in as <span className="font-semibold text-white">{user?.name}</span> ({user?.role?.name})
      </p>
      <button
        onClick={handleLogout}
        className="mt-4 rounded-full bg-[#A050F8] px-6 py-3 font-semibold text-white transition hover:scale-[1.02]"
      >
        Log out
      </button>
    </div>
  )
}
