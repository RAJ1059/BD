import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiGrid, FiFolder, FiUser, FiLogOut } from 'react-icons/fi'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/client', end: true, label: 'Dashboard', icon: FiGrid },
  { to: '/client/projects', label: 'My Projects', icon: FiFolder },
  { to: '/client/profile', label: 'My Profile', icon: FiUser },
]

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#141928]">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
          <img src={logo} alt="Business Directions" className="h-8 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-[#05B0BA]/15 text-[#05B0BA]' : 'text-[#8B93A7] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#141928] px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-[#5B6478]">{user?.role?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <FiLogOut size={16} />
            Log out
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
