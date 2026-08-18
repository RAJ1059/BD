import crypto from 'node:crypto'
import { Webhook } from '../models/Webhook.js'
import { logger } from '../config/logger.js'

export async function dispatchToWebhook(webhook, eventName, payload) {
  const body = { event: eventName, data: payload, timestamp: new Date().toISOString() }
  const headers = { 'Content-Type': 'application/json' }
  if (webhook.secret) {
    headers['X-Webhook-Signature'] = crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex')
  }

  let status = 'failed'
  let statusCode = null
  try {
    const res = await fetch(webhook.url, { method: 'POST', headers, body: JSON.stringify(body) })
    statusCode = res.status
    status = res.ok ? 'success' : 'failed'
  } catch (err) {
    logger.error(`Webhook dispatch failed for "${webhook.name}" (${webhook.url}): ${err.message}`)
  }

  try {
    await Webhook.updateOne({ _id: webhook._id }, { lastTriggeredAt: new Date(), lastStatus: status })
  } catch (err) {
    logger.error(`Failed to update webhook status for "${webhook.name}": ${err.message}`)
  }

  return { webhookId: webhook._id, name: webhook.name, status, statusCode }
}

// Fires every active webhook subscribed to `eventName`. Never throws — a
// single webhook's network failure never breaks the caller or the other
// webhooks in the batch.
export async function triggerWebhooks(eventName, payload) {
  const webhooks = await Webhook.find({ isActive: true, events: eventName })
  if (!webhooks.length) return []

  const results = await Promise.allSettled(webhooks.map((webhook) => dispatchToWebhook(webhook, eventName, payload)))
  return results.map((r) => (r.status === 'fulfilled' ? r.value : { status: 'failed', error: r.reason?.message }))
}
