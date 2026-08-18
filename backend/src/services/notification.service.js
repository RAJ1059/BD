import { env } from '../config/env.js'

/**
 * Best-effort side-channel notifications for Slack/Discord webhooks.
 * Callers should never need to handle a rejection — every failure mode
 * (missing config, network error, non-2xx response) resolves instead.
 */
export async function sendSlackNotification(message) {
  if (!env.notifications.slackWebhookUrl) return { delivered: false, reason: 'not_configured' }

  try {
    const res = await fetch(env.notifications.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
    return { delivered: res.ok }
  } catch (err) {
    return { delivered: false, reason: err.message }
  }
}

export async function sendDiscordNotification(message) {
  if (!env.notifications.discordWebhookUrl) return { delivered: false, reason: 'not_configured' }

  try {
    const res = await fetch(env.notifications.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    })
    return { delivered: res.ok }
  } catch (err) {
    return { delivered: false, reason: err.message }
  }
}
