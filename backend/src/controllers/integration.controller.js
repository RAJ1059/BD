import { catchAsync } from '../utils/catchAsync.js'
import { ok } from '../utils/ApiResponse.js'
import { Integration } from '../models/Integration.js'
import { INTEGRATION_PROVIDERS } from '../config/constants.js'
import { recordActivity } from '../services/activityLog.service.js'
import { fetchIntegrationReport } from '../services/integrations/index.js'

export const listIntegrations = catchAsync(async (_req, res) => {
  const docs = await Integration.find().select('-credentials')
  const byProvider = new Map(docs.map((doc) => [doc.provider, doc]))

  const items = INTEGRATION_PROVIDERS.map((provider) => byProvider.get(provider) || { provider, isConnected: false })
  return ok(res, items, 'Integrations')
})

export const getIntegrationStatus = catchAsync(async (req, res) => {
  const { provider } = req.params
  const doc = await Integration.findOne({ provider }).select('-credentials')
  return ok(res, doc || { provider, isConnected: false }, 'Integration status')
})

export const connectIntegration = catchAsync(async (req, res) => {
  const { provider } = req.params
  const doc = await Integration.upsertCredentials(provider, req.body, req.user._id)

  const safe = doc.toObject()
  delete safe.credentials

  await recordActivity(req, {
    action: 'update',
    module: 'integrations',
    targetId: doc._id,
    description: `Connected integration: ${provider}`,
  })
  return ok(res, safe, 'Integration connected')
})

export const disconnectIntegration = catchAsync(async (req, res) => {
  const { provider } = req.params
  const doc = await Integration.findOneAndUpdate(
    { provider },
    { isConnected: false, credentials: {} },
    { upsert: true, new: true }
  ).select('-credentials')

  await recordActivity(req, {
    action: 'update',
    module: 'integrations',
    targetId: doc._id,
    description: `Disconnected integration: ${provider}`,
  })
  return ok(res, doc, 'Integration disconnected')
})

export const testIntegrationConnection = catchAsync(async (req, res) => {
  const { provider } = req.params
  const result = await fetchIntegrationReport(provider)
  return ok(res, result, 'Integration test result')
})
