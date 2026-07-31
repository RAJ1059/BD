import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiGrid,
  FiUsers,
  FiShield,
  FiBriefcase,
  FiTarget,
  FiFolder,
  FiFileText,
  FiTag,
  FiImage,
  FiActivity,
  FiLogOut,
} from 'react-icons/fi'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { can } from '../lib/permissions'

const NAV_ITEMS = [
  { to: '/admin', end: true, label: 'Dashboard', icon: FiGrid, module: 'dashboard' },
  { to: '/admin/users', label: 'Users', icon: FiUsers, module: 'users' },
  { to: '/admin/roles', label: 'Roles', icon: FiShield, module: 'roles' },
  { to: '/admin/clients', label: 'Clients', icon: FiBriefcase, module: 'clients' },
  { to: '/admin/leads', label: 'Leads', icon: FiTarget, module: 'leads' },
  { to: '/admin/projects', label: 'Projects', icon: FiFolder, module: 'projects' },
  { to: '/admin/blogs', label: 'Blogs', icon: FiFileText, module: 'blogs' },
  { to: '/admin/categories', label: 'Categories', icon: FiTag, module: 'categories' },
  { to: '/admin/tags', label: 'Tags', icon: FiTag, module: 'tags' },
  { to: '/admin/media', label: 'Media', icon: FiImage, module: 'media' },
  { to: '/admin/activity-logs', label: 'Activity Logs', icon: FiActivity, module: 'activityLogs' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter((item) => can(user, item.module, 'view'))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#111115]">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
          <img src={logo} alt="Business Directions" className="h-8 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-[#A050F8]/15 text-[#A050F8]' : 'text-[#9898A6] hover:bg-white/5 hover:text-white'
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
        <header className="flex items-center justify-between border-b border-white/10 bg-[#111115] px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-[#6B6B78]">{user?.role?.name}</p>
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
