import nodemailer from 'nodemailer'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const isSmtpConfigured = Boolean(env.mail.host && env.mail.user && env.mail.pass)
const isSendgridConfigured = Boolean(env.sendgridApiKey)
const isMailgunConfigured = Boolean(env.mailgunApiKey && env.mailgunDomain)
const isSesConfigured = Boolean(env.awsSes.region && env.awsSes.accessKeyId && env.awsSes.secretAccessKey)

let transporter = null
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: { user: env.mail.user, pass: env.mail.pass },
  })
}

let sesClient = null
function getSesClient() {
  if (!sesClient) {
    sesClient = new SESClient({
      region: env.awsSes.region,
      credentials: { accessKeyId: env.awsSes.accessKeyId, secretAccessKey: env.awsSes.secretAccessKey },
    })
  }
  return sesClient
}

// Splits a "Name <email@x.com>" header into its parts; falls back to
// treating the whole string as a bare email when there are no angle brackets.
function parseFromHeader(fromString) {
  const match = /^(.*?)\s*<(.+)>$/.exec(fromString || '')
  if (!match) return { name: '', email: fromString || '' }
  return { name: match[1], email: match[2] }
}

async function sendViaSmtp({ to, subject, html, text }) {
  await transporter.sendMail({
    from: env.mail.from,
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, ' '),
  })
}

async function sendViaSendgrid({ to, subject, html, text }) {
  const from = parseFromHeader(env.mail.from)
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from.email, name: from.name || undefined },
      subject,
      content: [
        { type: 'text/plain', value: text || html?.replace(/<[^>]*>/g, ' ') },
        { type: 'text/html', value: html },
      ],
    }),
  })
  if (!res.ok) throw new Error(`SendGrid request failed with status ${res.status}`)
}

async function sendViaMailgun({ to, subject, html, text }) {
  const from = parseFromHeader(env.mail.from)
  const body = new URLSearchParams({
    from: env.mail.from || from.email,
    to,
    subject,
    html: html || '',
    text: text || html?.replace(/<[^>]*>/g, ' ') || '',
  })
  const res = await fetch(`https://api.mailgun.net/v3/${env.mailgunDomain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${env.mailgunApiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!res.ok) throw new Error(`Mailgun request failed with status ${res.status}`)
}

async function sendViaSes({ to, subject, html, text }) {
  const from = parseFromHeader(env.mail.from)
  await getSesClient().send(
    new SendEmailCommand({
      Source: from.email,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html || '' },
          Text: { Data: text || html?.replace(/<[^>]*>/g, ' ') || '' },
        },
      },
    })
  )
}

/**
 * Sends an email through whichever driver MAIL_DRIVER selects (smtp,
 * sendgrid, mailgun, or ses). When the selected driver isn't configured,
 * logs the payload so flows (password reset, invoice reminders, etc.)
 * keep working in dev without real credentials. Delivery failures throw,
 * matching the original SMTP-only contract, so existing callers that
 * `await` or `.catch()` this keep working unchanged.
 */
export async function sendEmail({ to, subject, html, text }) {
  const driver = env.mail.driver

  const configured =
    (driver === 'smtp' && isSmtpConfigured) ||
    (driver === 'sendgrid' && isSendgridConfigured) ||
    (driver === 'mailgun' && isMailgunConfigured) ||
    (driver === 'ses' && isSesConfigured)

  if (!configured) {
    logger.warn(`[email:disabled] Would send "${subject}" to ${to} (driver: ${driver})`)
    return { delivered: false, reason: `${driver}_not_configured` }
  }

  if (driver === 'sendgrid') {
    await sendViaSendgrid({ to, subject, html, text })
  } else if (driver === 'mailgun') {
    await sendViaMailgun({ to, subject, html, text })
  } else if (driver === 'ses') {
    await sendViaSes({ to, subject, html, text })
  } else {
    await sendViaSmtp({ to, subject, html, text })
  }

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
  newLeadNotification({ name, email, phone, service, message }) {
    return {
      subject: `New website lead: ${name}${service ? ` (${service})` : ''}`,
      html: `<p>A new lead was submitted on the website.</p>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone || '—'}</li>
          <li>Service: ${service || '—'}</li>
        </ul>
        <p>Project detail:</p>
        <p>${message || '—'}</p>`,
    }
  },
}
