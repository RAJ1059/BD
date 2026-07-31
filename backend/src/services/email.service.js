import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const isConfigured = Boolean(env.mail.host && env.mail.user && env.mail.pass)

let transporter = null
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: { user: env.mail.user, pass: env.mail.pass },
  })
}

/**
 * Sends an email when SMTP is configured; otherwise logs the payload so
 * flows (password reset, invoice reminders, etc.) keep working in dev
 * without real credentials. Swap in real SMTP env vars with zero code changes.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!isConfigured) {
    logger.warn(`[email:disabled] Would send "${subject}" to ${to}`)
    return { delivered: false, reason: 'smtp_not_configured' }
  }

  await transporter.sendMail({
    from: env.mail.from,
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, ' '),
  })
  return { delivered: true }
}

export const emailTemplates = {
  passwordReset(resetUrl) {
    return {
      subject: 'Reset your Business Direction admin password',
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 30 minutes.</p><p>If you did not request this, you can ignore this email.</p>`,
    }
  },
  passwordChanged() {
    return {
      subject: 'Your password was changed',
      html: `<p>Your Business Direction admin password was just changed. If this wasn't you, contact your administrator immediately.</p>`,
    }
  },
  newDeviceLogin({ device, ip, time }) {
    return {
      subject: 'New sign-in to your admin account',
      html: `<p>A new sign-in was detected.</p><ul><li>Device: ${device}</li><li>IP: ${ip}</li><li>Time: ${time}</li></ul>`,
    }
  },
}
