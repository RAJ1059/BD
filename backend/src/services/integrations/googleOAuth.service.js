// Minimal server-side Google OAuth2 "authorization code" flow — no SDK
// dependency, same philosophy as ga4.service.js/gsc.service.js. Reuses the
// same GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET already used for site login;
// the redirect URI below must additionally be added as an "Authorized
// redirect URI" on that OAuth client in Google Cloud Console.
import { env } from '../../config/env.js'

export function buildGoogleAuthUrl({ scope, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: env.integrations.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    // Forces Google to always return a refresh_token, even on reconnect.
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code, redirectUri) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.integrations.googleClientId,
      client_secret: env.integrations.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google token exchange failed (${res.status}): ${text || res.statusText}`)
  }
  return res.json()
}

export async function refreshGoogleAccessToken(refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.integrations.googleClientId,
      client_secret: env.integrations.googleClientSecret,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google token refresh failed (${res.status}): ${text || res.statusText}`)
  }
  const json = await res.json()
  return { accessToken: json.access_token, expiresAt: new Date(Date.now() + json.expires_in * 1000).toISOString() }
}

export async function listSearchConsoleSites(accessToken) {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to list Search Console sites (${res.status}): ${text || res.statusText}`)
  }
  const json = await res.json()
  return json.siteEntry || []
}
