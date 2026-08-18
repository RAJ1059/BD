import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { ApiKey } from '../models/ApiKey.js'
import { generateApiKey, hashApiKey } from '../services/apiKey.service.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listApiKeys = catchAsync(async (_req, res) => {
  const keys = await ApiKey.find().select('-keyHash').sort('-createdAt')
  return ok(res, keys, 'API keys')
})

export const createApiKey = catchAsync(async (req, res) => {
  const { name, scopes, expiresAt } = req.body
  const { raw, prefix } = generateApiKey()
  const keyHash = await hashApiKey(raw)

  const apiKey = await ApiKey.create({
    name,
    keyHash,
    keyPrefix: prefix,
    scopes: scopes || [],
    expiresAt: expiresAt || null,
    createdBy: req.user._id,
  })

  const doc = apiKey.toObject()
  delete doc.keyHash

  await recordActivity(req, { action: 'create', module: 'apiKeys', targetId: apiKey._id, description: `Created API key "${apiKey.name}"` })
  return created(res, { ...doc, key: raw }, 'API key created — copy it now, it will not be shown again')
})

export const revokeApiKey = catchAsync(async (req, res) => {
  const apiKey = await ApiKey.findById(req.params.id)
  if (!apiKey) throw ApiError.notFound('API key not found')

  apiKey.isActive = false
  await apiKey.save()

  await recordActivity(req, { action: 'update', module: 'apiKeys', targetId: apiKey._id, description: `Revoked API key "${apiKey.name}"` })
  return ok(res, apiKey, 'API key revoked')
})

export const deleteApiKey = catchAsync(async (req, res) => {
  const apiKey = await ApiKey.findById(req.params.id)
  if (!apiKey) throw ApiError.notFound('API key not found')

  await apiKey.deleteOne()

  await recordActivity(req, { action: 'delete', module: 'apiKeys', targetId: apiKey._id, description: `Deleted API key "${apiKey.name}"` })
  return noContent(res, 'API key deleted')
})
