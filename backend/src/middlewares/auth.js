import { ApiError } from '../utils/ApiError.js'
import { catchAsync } from '../utils/catchAsync.js'
import { verifyAccessToken } from '../services/token.service.js'
import { User } from '../models/User.js'

export const authenticate = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) throw ApiError.unauthorized('Authentication token missing')

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw ApiError.unauthorized('Invalid or expired session, please sign in again')
  }

  if (payload.tokenType !== 'access') throw ApiError.unauthorized('Invalid token type')

  const user = await User.findById(payload.sub).populate('role')
  if (!user) throw ApiError.unauthorized('Account no longer exists')
  if (!user.isActive) throw ApiError.forbidden('Account is disabled, contact your administrator')

  req.user = user
  next()
})

// Loads req.user if a valid token is present, but never rejects the request.
// Useful for public endpoints that behave slightly differently when logged in.
export const optionalAuthenticate = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()

  try {
    const payload = verifyAccessToken(token)
    if (payload.tokenType === 'access') {
      const user = await User.findById(payload.sub).populate('role')
      if (user && user.isActive) req.user = user
    }
  } catch {
    // ignore invalid tokens on optional routes
  }
  next()
})

export function requireSuperAdmin(req, _res, next) {
  if (req.user?.role?.name !== 'Super Admin') {
    return next(ApiError.forbidden('Only Super Admin can perform this action'))
  }
  next()
}
