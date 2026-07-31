import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles, denyRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role?.name)) {
    return <Navigate to="/login" replace />
  }

  if (denyRoles && denyRoles.includes(user.role?.name)) {
    return <Navigate to="/login" replace />
  }

  return children
}
