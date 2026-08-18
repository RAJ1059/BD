// GA4 Data API fetcher.
//
// LIMITATION: minting/refreshing an OAuth2 access token for a Google service
// account normally requires the `google-auth-library` package plus a stored
// service-account JSON key. Pulling that dependency in for a best-effort
// scaffold isn't worth it yet, so this implementation expects a valid,
// already-minted OAuth2 access token to be supplied directly in
// `credentials.accessToken` (e.g. produced by a separate short-lived
// process/cron that refreshes it and writes it back via
// `Integration.upsertCredentials`). Once that token is present, this function
// talks to the real GA4 Data API — no further code changes needed.
//
// Future enhancement: add a `/integrations/google_analytics/oauth/callback`
// route backed by `google-auth-library` to mint/refresh the access token
// automatically instead of requiring it to be pasted in externally.
export async function fetchGa4Summary(credentials) {
  if (!credentials?.propertyId) {
    throw new Error('GA4 propertyId not configured')
  }
  if (!credentials?.accessToken) {
    throw new Error('GA4 accessToken not configured (mint one externally and store it in credentials.accessToken)')
  }

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${credentials.propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }],
      }),
    }
  )

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`GA4 Data API request failed (${response.status}): ${text || response.statusText}`)
  }

  const json = await response.json()
  const rows = json.rows || []

  const byDate = rows.map((row) => ({
    date: row.dimensionValues?.[0]?.value || '',
    activeUsers: Number(row.metricValues?.[0]?.value || 0),
    pageViews: Number(row.metricValues?.[1]?.value || 0),
    sessions: Number(row.metricValues?.[2]?.value || 0),
  }))

  const totals = byDate.reduce(
    (acc, day) => ({
      activeUsers: acc.activeUsers + day.activeUsers,
      pageViews: acc.pageViews + day.pageViews,
      sessions: acc.sessions + day.sessions,
    }),
    { activeUsers: 0, pageViews: 0, sessions: 0 }
  )

  return { ...totals, byDate }
}
