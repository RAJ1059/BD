import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

// Generates a new raw API key ('bd_' + 64 hex chars) plus its display prefix
// (first 8 chars of the raw value, safe to show in a list UI).
export function generateApiKey() {
  const raw = `bd_${crypto.randomBytes(32).toString('hex')}`
  const prefix = raw.slice(0, 8)
  return { raw, prefix }
}

export async function hashApiKey(raw) {
  return bcrypt.hash(raw, 10)
}

export async function verifyApiKey(raw, hash) {
  return bcrypt.compare(raw, hash)
}
