import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Webhook } from '../models/Webhook.js'
import { dispatchToWebhook } from '../services/webhook.service.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listWebhooks = catchAsync(async (_req, res) => {
  const webhooks = await Webhook.find().sort('-createdAt')
  return ok(res, webhooks, 'Webhooks')
})

export const createWebhook = catchAsync(async (req, res) => {
  const { name, url, events, secret } = req.body
  const webhook = await Webhook.create({ name, url, events, secret: secret || '', createdBy: req.user._id })

  await recordActivity(req, { action: 'create', module: 'webhooks', targetId: webhook._id, description: `Created webhook "${webhook.name}"` })
  return created(res, webhook, 'Webhook created')
})

export const updateWebhook = catchAsync(async (req, res) => {
  const webhook = await Webhook.findById(req.params.id)
  if (!webhook) throw ApiError.notFound('Webhook not found')

  const { name, url, events, secret, isActive } = req.body
  if (name !== undefined) webhook.name = name
  if (url !== undefined) webhook.url = url
  if (events !== undefined) webhook.events = events
  if (secret !== undefined) webhook.secret = secret
  if (isActive !== undefined) webhook.isActive = isActive
  await webhook.save()

  await recordActivity(req, { action: 'update', module: 'webhooks', targetId: webhook._id, description: `Updated webhook "${webhook.name}"` })
  return ok(res, webhook, 'Webhook updated')
})

export const deleteWebhook = catchAsync(async (req, res) => {
  const webhook = await Webhook.findById(req.params.id)
  if (!webhook) throw ApiError.notFound('Webhook not found')

  await webhook.deleteOne()

  await recordActivity(req, { action: 'delete', module: 'webhooks', targetId: webhook._id, description: `Deleted webhook "${webhook.name}"` })
  return noContent(res, 'Webhook deleted')
})

export const testWebhook = catchAsync(async (req, res) => {
  const webhook = await Webhook.findById(req.params.id)
  if (!webhook) throw ApiError.notFound('Webhook not found')

  const result = await dispatchToWebhook(webhook, 'webhook.test', { message: 'This is a test event' })

  await recordActivity(req, { action: 'view', module: 'webhooks', targetId: webhook._id, description: `Sent test event to webhook "${webhook.name}"` })
  return ok(res, result, 'Test event dispatched')
})
