import { ApiError } from '../utils/ApiError.js'

/**
 * authorize('leads', 'edit') -> 403 unless the caller's role grants that
 * (module, action) pair. Super Admin always passes.
 */
export function authorize(module, action) {
  return (req, _res, next) => {
    const role = req.user?.role
    if (!role) return next(ApiError.unauthorized('Authentication required'))

    if (role.name === 'Super Admin') return next()

    if (typeof role.hasPermission === 'function' && role.hasPermission(module, action)) {
      return next()
    }

    return next(ApiError.forbidden(`You don't have permission to ${action} ${module}`))
  }
}

// Allows access if the caller is the resource owner OR has the permission,
// e.g. a Content Writer editing their own draft vs an Admin editing anyone's.
export function authorizeOwnerOrPermission(module, action, getOwnerId) {
  return (req, res, next) => {
    const role = req.user?.role
    if (!role) return next(ApiError.unauthorized('Authentication required'))

    if (role.name === 'Super Admin' || (typeof role.hasPermission === 'function' && role.hasPermission(module, action))) {
      return next()
    }

    const ownerId = getOwnerId(req)
    if (ownerId && req.user._id.equals(ownerId)) return next()

    return next(ApiError.forbidden(`You don't have permission to ${action} ${module}`))
  }
}
