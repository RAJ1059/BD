// Google Search Console (Search Analytics) fetcher. Credentials come from
// the OAuth connect flow (see googleOAuth.service.js + integration.controller.js
// `startGoogleOAuth`/`googleOAuthCallback`): `credentials.accessToken`,
// `credentials.refreshToken`, `credentials.expiresAt`, and the chosen
// `credentials.siteUrl` (e.g. "https://businessdirection.com/" or
// "sc-domain:businessdirection.com"). The access token is refreshed here
// automatically when expired.
import { refreshGoogleAccessToken } from './googleOAuth.service.js'

const GSC_BASE_URL = 'https://www.googleapis.com/webmasters/v3/sites'

async function querySearchAnalytics(siteUrl, accessToken, body) {
  const response = await fetch(`${GSC_BASE_URL}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Search Console API request failed (${response.status}): ${text || response.statusText}`)
  }

  return response.json()
}

export async function fetchGscSummary(credentials, { onRefresh } = {}) {
  if (!credentials?.siteUrl) {
    throw new Error('Search Console site not selected yet')
  }
  if (!credentials?.accessToken && !credentials?.refreshToken) {
    throw new Error('Search Console is not connected')
  }

  const { siteUrl } = credentials
  let { accessToken, expiresAt } = credentials

  if (credentials.refreshToken && (!expiresAt || new Date(expiresAt) <= new Date())) {
    const refreshed = await refreshGoogleAccessToken(credentials.refreshToken)
    accessToken = refreshed.accessToken
    expiresAt = refreshed.expiresAt
    if (onRefresh) await onRefresh({ accessToken, expiresAt })
  }

  const dateRange = { startDate: '28daysAgo', endDate: 'today' }

  const [byDateJson, byQueryJson, byPageJson] = await Promise.all([
    querySearchAnalytics(siteUrl, accessToken, { ...dateRange, dimensions: ['date'] }),
    querySearchAnalytics(siteUrl, accessToken, { ...dateRange, dimensions: ['query'], rowLimit: 10 }),
    querySearchAnalytics(siteUrl, accessToken, { ...dateRange, dimensions: ['page'], rowLimit: 10 }),
  ])

  const byDate = (byDateJson.rows || []).map((row) => ({
    date: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }))

  const topQueries = (byQueryJson.rows || []).map((row) => ({
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }))

  const topPages = (byPageJson.rows || []).map((row) => ({
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }))

  const totals = byDate.reduce(
    (acc, day) => ({
      clicks: acc.clicks + day.clicks,
      impressions: acc.impressions + day.impressions,
      positionWeighted: acc.positionWeighted + day.position * day.impressions,
    }),
    { clicks: 0, impressions: 0, positionWeighted: 0 }
  )

  return {
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.impressions ? totals.clicks / totals.impressions : 0,
      position: totals.impressions ? totals.positionWeighted / totals.impressions : 0,
    },
    byDate,
    topQueries,
    topPages,
  }
}
