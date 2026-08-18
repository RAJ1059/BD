import bcrypt from 'bcryptjs'
import { ApiKey } from '../models/ApiKey.js'
import { ApiError } from '../utils/ApiError.js'
import { catchAsync } from '../utils/catchAsync.js'

// Alternative auth strategy for external/machine consumers. Not wired into
// any existing route automatically — routes that want to accept an API key
// instead of (or in addition to) a JWT should import and use this directly.
export const apiKeyAuth = catchAsync(async (req, _res, next) => {
  const raw = req.headers['x-api-key']
  if (!raw || typeof raw !== 'string') throw ApiError.unauthorized('Invalid API key')

  const prefix = raw.slice(0, 8)
  const candidates = await ApiKey.find({
    keyPrefix: prefix,
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  }).select('+keyHash')

  let matched = null
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await bcrypt.compare(raw, candidate.keyHash)) {
      matched = candidate
      break
    }
  }

  if (!matched) throw ApiError.unauthorized('Invalid API key')

  req.apiKey = matched
  ApiKey.updateOne({ _id: matched._id }, { lastUsedAt: new Date() }).catch(() => {})

  next()
})
