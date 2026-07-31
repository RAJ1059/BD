import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../config/env.js'

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role?._id?.toString() || user.role?.toString(), tokenType: 'access' },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpires }
  )
}

export function signRefreshToken(user, { rememberMe = false } = {}) {
  const expiresIn = rememberMe ? env.jwt.refreshExpiresRememberMe : env.jwt.refreshExpires
  const jti = crypto.randomUUID()
  const token = jwt.sign({ sub: user._id.toString(), tokenType: 'refresh', jti }, env.jwt.refreshSecret, { expiresIn })
  return { token, jti, expiresIn }
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function msFromJwtExpiry(expiresIn) {
  const match = /^(\d+)([smhd])$/.exec(expiresIn)
  if (!match) return 15 * 60 * 1000
  const value = Number(match[1])
  const unit = match[2]
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return value * multipliers[unit]
}
