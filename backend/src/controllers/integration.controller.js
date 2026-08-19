import jwt from 'jsonwebtoken'
import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/ApiResponse.js'
import { Integration } from '../models/Integration.js'
import { INTEGRATION_PROVIDERS } from '../config/constants.js'
import { env } from '../config/env.js'
import { recordActivity } from '../services/activityLog.service.js'
import { fetchIntegrationReport } from '../services/integrations/index.js'
import { buildGoogleAuthUrl, exchangeCodeForTokens, listSearchConsoleSites } from '../services/integrations/googleOAuth.service.js'

// Credential fields safe to expose to the admin UI (everything else —
// accessToken, refreshToken — never leaves the server).
const SAFE_CREDENTIAL_FIELDS = {
  google_search_console: ['siteUrl', 'availableSites'],
  google_analytics: ['propertyId'],
}

function redact(doc) {
  const obj = doc.toObject ? doc.toObject() : doc
  const safeFields = SAFE_CREDENTIAL_FIELDS[obj.provider] || []
  const credentials = {}
  for (const field of safeFields) {
    if (obj.credentials?.[field] !== undefined) credentials[field] = obj.credentials[field]
  }
  return { ...obj, credentials }
}

export const listIntegrations = catchAsync(async (_req, res) => {
  const docs = await Integration.find()
  const byProvider = new Map(docs.map((doc) => [doc.provider, redact(doc)]))

  const items = INTEGRATION_PROVIDERS.map((provider) => byProvider.get(provider) || { provider, isConnected: false })
  return ok(res, items, 'Integrations')
})

export const getIntegrationStatus = catchAsync(async (req, res) => {
  const { provider } = req.params
  const doc = await Integration.findOne({ provider })
  return ok(res, doc ? redact(doc) : { provider, isConnected: false }, 'Integration status')
})

export const connectIntegration = catchAsync(async (req, res) => {
  const { provider } = req.params
  const doc = await Integration.upsertCredentials(provider, req.body, req.user._id)

  await recordActivity(req, {
    action: 'update',
    module: 'integrations',
    targetId: doc._id,
    description: `Connected integration: ${provider}`,
  })
  return ok(res, redact(doc), 'Integration connected')
})

export const disconnectIntegration = catchAsync(async (req, res) => {
  const { provider } = req.params
  const doc = await Integration.findOneAndUpdate(
    { provider },
    { isConnected: false, credentials: {} },
    { upsert: true, new: true }
  )

  await recordActivity(req, {
    action: 'update',
    module: 'integrations',
    targetId: doc._id,
    description: `Disconnected integration: ${provider}`,
  })
  return ok(res, redact(doc), 'Integration disconnected')
})

// Providers that support the "Sign in with Google" OAuth connect flow, and
// the scope each needs. Extend this map (plus a fetcher branch) to add more.
const GOOGLE_OAUTH_SCOPES = {
  google_search_console: 'https://www.googleapis.com/auth/webmasters.readonly',
}

function googleOAuthRedirectUri() {
  return `${env.apiBaseUrl}/api/oauth/google/callback`
}

/**
 * GET /api/integrations/:provider/oauth/url
 * Returns the Google consent URL for the admin's browser to navigate to
 * directly (a full-page redirect, not an XHR — Google won't render inside an
 * iframe/fetch). The `state` is a short-lived signed JWT so the callback
 * (which Google calls with no auth headers) can verify who initiated it.
 */
export const startGoogleOAuth = catchAsync(async (req, res) => {
  const { provider } = req.params
  const scope = GOOGLE_OAUTH_SCOPES[provider]
  if (!scope) throw ApiError.badRequest(`Google OAuth connect is not supported for ${provider}`)
  if (!env.integrations.googleClientId || !env.integrations.googleClientSecret) {
    throw new ApiError(501, 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
  }

  const state = jwt.sign({ sub: req.user._id.toString(), provider, tokenType: 'oauth_state' }, env.jwt.accessSecret, {
    expiresIn: '10m',
  })
  const url = buildGoogleAuthUrl({ scope, redirectUri: googleOAuthRedirectUri(), state })
  return ok(res, { url }, 'Google OAuth URL')
})

/**
 * GET /api/oauth/google/callback
 * Unauthenticated — Google redirects the user's browser here directly with
 * no Authorization header. Trust is established purely via the signed
 * `state` param minted by startGoogleOAuth above.
 */
export const googleOAuthCallback = catchAsync(async (req, res) => {
  const { code, state, error: oauthError } = req.query
  const failRedirect = (reason) =>
    res.redirect(`${env.adminClientUrl}/admin/integrations?oauthError=${encodeURIComponent(reason)}`)

  if (oauthError) return failRedirect(String(oauthError))
  if (!code || !state) return failRedirect('missing_code_or_state')

  let decoded
  try {
    decoded = jwt.verify(state, env.jwt.accessSecret)
  } catch {
    return failRedirect('invalid_or_expired_state')
  }
  if (decoded.tokenType !== 'oauth_state' || !decoded.provider) return failRedirect('invalid_state')

  const { provider, sub: userId } = decoded

  try {
    const tokens = await exchangeCodeForTokens(code, googleOAuthRedirectUri())
    const credentials = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }

    if (provider === 'google_search_console') {
      const sites = await listSearchConsoleSites(tokens.access_token)
      const verified = sites.filter((s) => ['siteOwner', 'siteFullUser'].includes(s.permissionLevel))
      const chosen = verified[0] || sites[0]
      credentials.siteUrl = chosen?.siteUrl || ''
      credentials.availableSites = sites.map((s) => s.siteUrl)
    }

    const doc = await Integration.upsertCredentials(provider, credentials, userId)

    await recordActivity(
      { user: { _id: userId }, ip: req.ip, headers: req.headers },
      { action: 'update', module: 'integrations', targetId: doc._id, description: `Connected integration via OAuth: ${provider}` }
    )

    return res.redirect(`${env.adminClientUrl}/admin/integrations?connected=${provider}`)
  } catch (err) {
    return failRedirect(err.message)
  }
})

/**
 * PATCH /api/integrations/:provider/site
 * Lets the admin switch which verified Search Console property is used for
 * reporting, without redoing the OAuth consent flow.
 */
export const updateIntegrationSite = catchAsync(async (req, res) => {
  const { provider } = req.params
  const { siteUrl } = req.body
  const doc = await Integration.findOne({ provider })
  if (!doc || !doc.isConnected) throw ApiError.notFound('Integration is not connected')
  if (!doc.credentials?.availableSites?.includes(siteUrl)) {
    throw ApiError.badRequest('siteUrl is not one of this account\'s verified Search Console properties')
  }

  doc.credentials = { ...doc.credentials, siteUrl }
  await doc.save()

  await recordActivity(req, { action: 'update', module: 'integrations', targetId: doc._id, description: `Switched ${provider} site to ${siteUrl}` })
  return ok(res, redact(doc), 'Site updated')
})

export const testIntegrationConnection = catchAsync(async (req, res) => {
  const { provider } = req.params
  const result = await fetchIntegrationReport(provider)
  return ok(res, result, 'Integration test result')
})
