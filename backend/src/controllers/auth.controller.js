import crypto from 'node:crypto'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created } from '../utils/ApiResponse.js'
import { User } from '../models/User.js'
import { Role } from '../models/Role.js'
import { RefreshToken } from '../models/RefreshToken.js'
import { Device } from '../models/Device.js'
import { LoginHistory } from '../models/LoginHistory.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken, msFromJwtExpiry } from '../services/token.service.js'
import { sendEmail, emailTemplates } from '../services/email.service.js'
import { recordActivity } from '../services/activityLog.service.js'
import { env } from '../config/env.js'
import { ROLE_NAMES } from '../config/constants.js'

const REFRESH_COOKIE_NAME = 'bd_refresh_token'

function deviceLabelFromUserAgent(userAgent = '') {
  if (/mobile/i.test(userAgent)) return 'Mobile device'
  if (/tablet/i.test(userAgent)) return 'Tablet'
  if (/windows/i.test(userAgent)) return 'Windows PC'
  if (/mac os/i.test(userAgent)) return 'Mac'
  if (/linux/i.test(userAgent)) return 'Linux PC'
  return 'Unknown device'
}

async function findOrCreateDevice(user, req) {
  const userAgent = req.headers['user-agent'] || ''
  const ip = req.ip
  let device = await Device.findOne({ user: user._id, userAgent, revokedAt: null })
  if (!device) {
    device = await Device.create({ user: user._id, userAgent, ip, label: deviceLabelFromUserAgent(userAgent) })
  } else {
    device.lastActiveAt = new Date()
    device.ip = ip
    await device.save()
  }
  return device
}

function setRefreshCookie(res, token, expiresInMs) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    maxAge: expiresInMs,
    path: '/api/auth',
  })
}

async function issueSession(req, res, user, { rememberMe = false } = {}) {
  const device = await findOrCreateDevice(user, req)
  const accessToken = signAccessToken(user)
  const { token: refreshToken, expiresIn } = signRefreshToken(user, { rememberMe })
  const expiresInMs = msFromJwtExpiry(expiresIn)

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    device: device._id,
    rememberMe,
    expiresAt: new Date(Date.now() + expiresInMs),
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
  })

  setRefreshCookie(res, refreshToken, expiresInMs)
  return { accessToken, device }
}

/**
 * POST /api/auth/login
 */
export const login = catchAsync(async (req, res) => {
  const { email, password, rememberMe, twoFactorCode } = req.body

  const user = await User.findOne({ email }).select('+passwordHash +twoFactor.secret +twoFactor.backupCodes').populate('role')

  const fail = async (reason) => {
    await LoginHistory.create({ email, success: false, reason, ip: req.ip, userAgent: req.headers['user-agent'] || '' })
    throw ApiError.unauthorized('Invalid email or password')
  }

  if (!user) return fail('user_not_found')
  if (!user.isActive) return fail('account_disabled')

  const validPassword = await user.comparePassword(password)
  if (!validPassword) return fail('invalid_password')

  if (user.twoFactor?.enabled) {
    if (!twoFactorCode) {
      return res.status(200).json({ success: true, message: 'Two-factor code required', data: { twoFactorRequired: true } })
    }
    const verified = speakeasy.totp.verify({ secret: user.twoFactor.secret, encoding: 'base32', token: twoFactorCode, window: 1 })
    const isBackupCode = user.twoFactor.backupCodes?.includes(twoFactorCode)
    if (!verified && !isBackupCode) {
      await LoginHistory.create({ user: user._id, email, success: false, reason: 'invalid_2fa', ip: req.ip, userAgent: req.headers['user-agent'] || '' })
      throw ApiError.unauthorized('Invalid two-factor authentication code')
    }
    if (isBackupCode) {
      user.twoFactor.backupCodes = user.twoFactor.backupCodes.filter((c) => c !== twoFactorCode)
      await user.save()
    }
  }

  const { accessToken, device } = await issueSession(req, res, user, { rememberMe: Boolean(rememberMe) })

  user.lastLoginAt = new Date()
  await user.save()

  await LoginHistory.create({ user: user._id, email, success: true, ip: req.ip, userAgent: req.headers['user-agent'] || '', device: device._id })
  await recordActivity(req, { action: 'login', module: 'auth', description: `${user.name} signed in` })

  return ok(
    res,
    { accessToken, user: { ...user.toSafeObject(), role: user.role } },
    'Login successful'
  )
})

/**
 * POST /api/auth/register
 * Public self-service registration for client accounts.
 */
export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) throw ApiError.badRequest('An account with this email already exists')

  const clientRole = await Role.findOne({ name: ROLE_NAMES.CLIENT })
  if (!clientRole) throw ApiError.badRequest('Client role is not configured. Contact an administrator.')

  const user = await User.create({ name, email, passwordHash: password, role: clientRole._id })
  await user.populate('role')

  const { accessToken } = await issueSession(req, res, user)
  user.lastLoginAt = new Date()
  await user.save()

  await recordActivity(req, { action: 'register', module: 'auth', description: `${user.name} created a client account` })

  return created(res, { accessToken, user: { ...user.toSafeObject(), role: user.role } }, 'Account created')
})

/**
 * POST /api/auth/refresh
 */
export const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!token) throw ApiError.unauthorized('No refresh token provided')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw ApiError.unauthorized('Refresh session expired, please sign in again')
  }

  const tokenHash = hashToken(token)
  const stored = await RefreshToken.findOne({ tokenHash })
  if (!stored || !stored.isActive()) {
    throw ApiError.unauthorized('Refresh session is no longer valid, please sign in again')
  }

  const user = await User.findById(payload.sub).populate('role')
  if (!user || !user.isActive) throw ApiError.unauthorized('Account no longer available')

  // Rotate: revoke the old refresh token, issue a brand new one.
  stored.revokedAt = new Date()
  const { token: newRefreshToken, expiresIn } = signRefreshToken(user, { rememberMe: stored.rememberMe })
  stored.replacedByTokenHash = hashToken(newRefreshToken)
  await stored.save()

  const expiresInMs = msFromJwtExpiry(expiresIn)
  await RefreshToken.create({
    user: user._id,
    tokenHash: stored.replacedByTokenHash,
    device: stored.device,
    rememberMe: stored.rememberMe,
    expiresAt: new Date(Date.now() + expiresInMs),
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
  })

  setRefreshCookie(res, newRefreshToken, expiresInMs)
  const accessToken = signAccessToken(user)

  return ok(res, { accessToken }, 'Session refreshed')
})

/**
 * POST /api/auth/logout
 */
export const logout = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]
  if (token) {
    await RefreshToken.updateOne({ tokenHash: hashToken(token) }, { revokedAt: new Date() })
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
  return ok(res, null, 'Logged out')
})

/**
 * POST /api/auth/logout-all
 */
export const logoutAll = catchAsync(async (req, res) => {
  await RefreshToken.updateMany({ user: req.user._id, revokedAt: null }, { revokedAt: new Date() })
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
  await recordActivity(req, { action: 'logout_all', module: 'auth', description: `${req.user.name} signed out of all devices` })
  return ok(res, null, 'Signed out of all devices')
})

/**
 * GET /api/auth/me
 */
export const me = catchAsync(async (req, res) => {
  return ok(res, { ...req.user.toSafeObject(), role: req.user.role }, 'Current session')
})

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  // Always respond the same way so we don't leak which emails exist.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = hashToken(rawToken)
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000)
    await user.save()

    const resetUrl = `${env.adminClientUrl}/reset-password/${rawToken}`
    const { subject, html } = emailTemplates.passwordReset(resetUrl)
    await sendEmail({ to: user.email, subject, html })
    await recordActivity(req, { action: 'forgot_password', module: 'auth', description: `Password reset requested for ${user.email}` })
  }

  return ok(res, null, 'If that email exists, a reset link has been sent')
})

/**
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const tokenHash = hashToken(token)

  const user = await User.findOne({ passwordResetToken: tokenHash, passwordResetExpires: { $gt: new Date() } })
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired')

  user.passwordHash = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() })

  const { subject, html } = emailTemplates.passwordChanged()
  await sendEmail({ to: user.email, subject, html })
  await recordActivity(req, { action: 'reset_password', module: 'auth', description: `Password reset completed for ${user.email}` })

  return ok(res, null, 'Password reset successful, please sign in')
})

/**
 * POST /api/auth/change-password
 */
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+passwordHash')

  const valid = await user.comparePassword(currentPassword)
  if (!valid) throw ApiError.badRequest('Current password is incorrect')

  user.passwordHash = newPassword
  await user.save()

  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() })
  const { subject, html } = emailTemplates.passwordChanged()
  await sendEmail({ to: user.email, subject, html })
  await recordActivity(req, { action: 'change_password', module: 'auth', description: `${user.name} changed their password` })

  return ok(res, null, 'Password changed successfully, please sign in again')
})

/**
 * GET /api/auth/login-history
 */
export const loginHistory = catchAsync(async (req, res) => {
  const history = await LoginHistory.find({ user: req.user._id }).sort('-createdAt').limit(50)
  return ok(res, history, 'Login history')
})

/**
 * GET /api/auth/devices
 */
export const listDevices = catchAsync(async (req, res) => {
  const devices = await Device.find({ user: req.user._id, revokedAt: null }).sort('-lastActiveAt')
  return ok(res, devices, 'Active devices')
})

/**
 * DELETE /api/auth/devices/:id
 */
export const revokeDevice = catchAsync(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.id, user: req.user._id })
  if (!device) throw ApiError.notFound('Device not found')

  device.revokedAt = new Date()
  await device.save()
  await RefreshToken.updateMany({ device: device._id, revokedAt: null }, { revokedAt: new Date() })
  await recordActivity(req, { action: 'revoke_device', module: 'auth', description: `${req.user.name} revoked device ${device.label}` })

  return ok(res, null, 'Device signed out')
})

/**
 * POST /api/auth/2fa/setup
 */
export const setupTwoFactor = catchAsync(async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `${env.appName} (${req.user.email})` })
  const user = await User.findById(req.user._id)
  user.twoFactor.secret = secret.base32
  user.twoFactor.enabled = false
  await user.save()

  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url)
  return ok(res, { qrDataUrl, secret: secret.base32 }, 'Scan the QR code with your authenticator app, then verify to enable 2FA')
})

/**
 * POST /api/auth/2fa/verify
 */
export const verifyTwoFactor = catchAsync(async (req, res) => {
  const { code } = req.body
  const user = await User.findById(req.user._id).select('+twoFactor.secret')

  if (!user.twoFactor?.secret) throw ApiError.badRequest('Run 2FA setup first')

  const verified = speakeasy.totp.verify({ secret: user.twoFactor.secret, encoding: 'base32', token: code, window: 1 })
  if (!verified) throw ApiError.badRequest('Invalid code')

  const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'))
  user.twoFactor.enabled = true
  user.twoFactor.backupCodes = backupCodes
  await user.save()

  await recordActivity(req, { action: 'enable_2fa', module: 'auth', description: `${user.name} enabled two-factor authentication` })
  return ok(res, { backupCodes }, 'Two-factor authentication enabled. Store these backup codes safely.')
})

/**
 * POST /api/auth/2fa/disable
 */
export const disableTwoFactor = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.twoFactor = { enabled: false, secret: undefined, backupCodes: [] }
  await user.save()
  await recordActivity(req, { action: 'disable_2fa', module: 'auth', description: `${user.name} disabled two-factor authentication` })
  return ok(res, null, 'Two-factor authentication disabled')
})

/**
 * POST /api/auth/google
 * Sign in (or self-register a client account) with a Google ID token.
 * Verifies the token against Google's tokeninfo endpoint (no SDK dependency)
 * and requires GOOGLE_CLIENT_ID to be set. Existing users of any role can
 * sign in this way; an unrecognized email is auto-provisioned as a Client.
 */
export const googleLogin = catchAsync(async (req, res) => {
  if (!env.integrations.googleClientId) {
    throw new ApiError(501, 'Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.')
  }

  const { idToken } = req.body
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  if (!response.ok) throw ApiError.unauthorized('Invalid Google token')

  const payload = await response.json()
  if (payload.aud !== env.integrations.googleClientId) throw ApiError.unauthorized('Google token was not issued for this application')
  if (!payload.email_verified || payload.email_verified === 'false') {
    throw ApiError.unauthorized('Google account email is not verified')
  }

  let user = await User.findOne({ email: payload.email }).populate('role')
  let isNewUser = false

  if (!user) {
    const clientRole = await Role.findOne({ name: ROLE_NAMES.CLIENT })
    if (!clientRole) throw ApiError.badRequest('Client role is not configured. Contact an administrator.')

    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      avatar: payload.picture || '',
      passwordHash: crypto.randomBytes(32).toString('hex'),
      role: clientRole._id,
      googleId: payload.sub,
    })
    await user.populate('role')
    isNewUser = true
  }

  if (!user.isActive) throw ApiError.forbidden('Account is disabled')

  if (!user.googleId) {
    user.googleId = payload.sub
    await user.save()
  }

  const { accessToken } = await issueSession(req, res, user)
  user.lastLoginAt = new Date()
  await user.save()

  await recordActivity(req, {
    action: isNewUser ? 'register_google' : 'login_google',
    module: 'auth',
    description: `${user.name} ${isNewUser ? 'signed up' : 'signed in'} with Google`,
  })

  return ok(
    res,
    { accessToken, user: { ...user.toSafeObject(), role: user.role }, isNewUser },
    isNewUser ? 'Account created' : 'Login successful'
  )
})
