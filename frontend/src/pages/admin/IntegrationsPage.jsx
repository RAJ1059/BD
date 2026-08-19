import { useEffect, useState, useCallback } from 'react'
import { FiLink, FiLink2, FiRefreshCw } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import Badge from '../../components/admin/Badge'
import StatCard from '../../components/admin/StatCard'
import { TextArea } from '../../components/admin/FormField'
import { integrationsApi } from '../../api/integrations'
import { ApiError } from '../../lib/api'

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}

// Provider-specific dashboards render from whatever shape that provider's
// fetcher (backend/src/services/integrations/*.service.js) returns.
// Providers with no fetcher wired up yet just show the raw JSON.
function IntegrationDashboard({ provider, data }) {
  if (provider === 'google_search_console') {
    const { totals, topQueries } = data
    return (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Clicks (28d)" value={totals.clicks.toLocaleString()} />
          <StatCard label="Impressions (28d)" value={totals.impressions.toLocaleString()} />
          <StatCard label="Avg. CTR" value={formatPercent(totals.ctr)} />
          <StatCard label="Avg. position" value={totals.position.toFixed(1)} />
        </div>
        {topQueries?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5B6478]">Top queries</p>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-[#8B93A7]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Query</th>
                    <th className="px-3 py-2 font-medium">Clicks</th>
                    <th className="px-3 py-2 font-medium">Impressions</th>
                    <th className="px-3 py-2 font-medium">CTR</th>
                    <th className="px-3 py-2 font-medium">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((row) => (
                    <tr key={row.query} className="border-t border-white/5 text-[#C4C4CC]">
                      <td className="px-3 py-2">{row.query}</td>
                      <td className="px-3 py-2">{row.clicks}</td>
                      <td className="px-3 py-2">{row.impressions}</td>
                      <td className="px-3 py-2">{formatPercent(row.ctr)}</td>
                      <td className="px-3 py-2">{row.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (provider === 'google_analytics') {
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard label="Active users (7d)" value={data.activeUsers.toLocaleString()} />
        <StatCard label="Page views (7d)" value={data.pageViews.toLocaleString()} />
        <StatCard label="Sessions (7d)" value={data.sessions.toLocaleString()} />
      </div>
    )
  }

  return (
    <pre className="mt-4 max-h-48 overflow-auto rounded-xl border border-white/10 bg-[#0B0E14] p-3 text-xs text-[#8B93A7]">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

const INTEGRATION_PROVIDERS = [
  'google_analytics',
  'google_search_console',
  'google_tag_manager',
  'google_ads',
  'meta_ads',
  'microsoft_clarity',
  'linkedin_ads',
]

function formatProviderName(provider) {
  return provider
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Providers with a real "Sign in with Google" OAuth connect flow (see
// backend integration.controller.js startGoogleOAuth/googleOAuthCallback).
// Everything else falls back to the generic paste-JSON-credentials modal.
const GOOGLE_OAUTH_PROVIDERS = ['google_search_console']

export default function IntegrationsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [connectTarget, setConnectTarget] = useState(null)
  const [credentialsText, setCredentialsText] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [testingProvider, setTestingProvider] = useState(null)
  const [disconnectingProvider, setDisconnectingProvider] = useState(null)
  const [connectingProvider, setConnectingProvider] = useState(null)
  const [switchingSite, setSwitchingSite] = useState(null)
  const [reports, setReports] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await integrationsApi.list()
      const byProvider = new Map(res.data.map((item) => [item.provider, item]))
      setRows(INTEGRATION_PROVIDERS.map((provider) => byProvider.get(provider) || { provider, isConnected: false }))
      return byProvider
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load integrations')
      return new Map()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // After a full-page OAuth round trip, Google redirects back to
  // /admin/integrations?connected=<provider> (or ?oauthError=<reason>) via
  // the backend callback. Surface that result once, then clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const oauthError = params.get('oauthError')
    if (!connected && !oauthError) return

    if (connected) {
      setSuccess(`${formatProviderName(connected)} connected`)
      load().then(() => handleTest(connected, { silent: true }))
    } else if (oauthError) {
      setError(`Google connection failed: ${oauthError.replace(/_/g, ' ')}`)
    }
    window.history.replaceState({}, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openConnect = (provider) => {
    setConnectTarget(provider)
    setCredentialsText('')
    setFormError('')
  }

  const handleConnectClick = async (provider) => {
    if (!GOOGLE_OAUTH_PROVIDERS.includes(provider)) return openConnect(provider)

    setConnectingProvider(provider)
    setError('')
    try {
      const res = await integrationsApi.getOAuthUrl(provider)
      window.location.href = res.data.url
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start Google sign-in')
      setConnectingProvider(null)
    }
  }

  const handleSiteChange = async (provider, siteUrl) => {
    setSwitchingSite(provider)
    setError('')
    try {
      await integrationsApi.updateSite(provider, siteUrl)
      await load()
      await handleTest(provider, { silent: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to switch site')
    } finally {
      setSwitchingSite(null)
    }
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    setFormError('')
    let credentials
    try {
      credentials = credentialsText.trim() ? JSON.parse(credentialsText) : {}
    } catch {
      setFormError('Credentials must be valid JSON.')
      return
    }
    setSaving(true)
    try {
      await integrationsApi.connect(connectTarget, credentials)
      setSuccess(`${formatProviderName(connectTarget)} connected`)
      const connectedProvider = connectTarget
      setConnectTarget(null)
      await load()
      await handleTest(connectedProvider, { silent: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to connect integration')
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async (provider) => {
    setDisconnectingProvider(provider)
    setError('')
    try {
      await integrationsApi.disconnect(provider)
      setSuccess(`${formatProviderName(provider)} disconnected`)
      setReports((prev) => {
        const next = { ...prev }
        delete next[provider]
        return next
      })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to disconnect integration')
    } finally {
      setDisconnectingProvider(null)
    }
  }

  const handleTest = async (provider, { silent = false } = {}) => {
    setTestingProvider(provider)
    if (!silent) {
      setError('')
      setSuccess('')
    }
    try {
      const res = await integrationsApi.test(provider)
      setReports((prev) => ({ ...prev, [provider]: res.data }))
      if (!silent) {
        setSuccess(
          res.data?.available ? `${formatProviderName(provider)} connection test succeeded` : `${formatProviderName(provider)}: ${res.data?.reason}`
        )
      }
    } catch (err) {
      if (!silent) setError(err instanceof ApiError ? err.message : 'Connection test failed')
    } finally {
      setTestingProvider(null)
    }
  }

  return (
    <div>
      <PageHeader title="Integrations" description="Connect third-party analytics, ads and marketing platforms." />
      {error && <Banner>{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      {loading ? (
        <p className="text-[#8B93A7]">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.provider}
              className={`rounded-2xl border border-white/10 bg-[#141928] p-5 ${
                reports[row.provider]?.available ? 'sm:col-span-2 lg:col-span-3' : ''
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{formatProviderName(row.provider)}</h3>
                <Badge tone={row.isConnected ? 'green' : 'neutral'}>{row.isConnected ? 'Connected' : 'Not connected'}</Badge>
              </div>

              {row.isConnected && row.lastSyncedAt && (
                <p className="mb-2 text-xs text-[#5B6478]">Last synced {new Date(row.lastSyncedAt).toLocaleString()}</p>
              )}
              {row.lastError && <p className="mb-3 text-xs text-red-400">{row.lastError}</p>}

              <div className="mt-4 flex gap-2">
                {row.isConnected ? (
                  <>
                    <SecondaryButton type="button" onClick={() => handleTest(row.provider)} disabled={testingProvider === row.provider}>
                      <FiRefreshCw /> {testingProvider === row.provider ? 'Testing...' : 'Test connection'}
                    </SecondaryButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => handleDisconnect(row.provider)}
                      disabled={disconnectingProvider === row.provider}
                    >
                      <FiLink2 /> {disconnectingProvider === row.provider ? 'Disconnecting...' : 'Disconnect'}
                    </SecondaryButton>
                  </>
                ) : (
                  <PrimaryButton type="button" onClick={() => handleConnectClick(row.provider)} disabled={connectingProvider === row.provider}>
                    <FiLink /> {connectingProvider === row.provider ? 'Redirecting...' : GOOGLE_OAUTH_PROVIDERS.includes(row.provider) ? 'Sign in with Google' : 'Connect'}
                  </PrimaryButton>
                )}
              </div>

              {row.isConnected && row.credentials?.availableSites?.length > 1 && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-[#8B93A7]">Property</label>
                  <select
                    value={row.credentials.siteUrl || ''}
                    onChange={(e) => handleSiteChange(row.provider, e.target.value)}
                    disabled={switchingSite === row.provider}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0B0E14] px-3 py-2 text-sm text-white outline-none focus:border-[#05B0BA]"
                  >
                    {row.credentials.availableSites.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {row.isConnected && reports[row.provider]?.available && (
                <IntegrationDashboard provider={row.provider} data={reports[row.provider].data} />
              )}
              {row.isConnected && reports[row.provider] && !reports[row.provider].available && (
                <p className="mt-3 text-xs text-[#5B6478]">{reports[row.provider].reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(connectTarget)}
        onClose={() => setConnectTarget(null)}
        title={connectTarget ? `Connect ${formatProviderName(connectTarget)}` : ''}
        width="max-w-lg"
      >
        <form onSubmit={handleConnect} className="space-y-4">
          {formError && <Banner>{formError}</Banner>}
          <TextArea
            label="Credentials (JSON)"
            rows={8}
            hint="Paste the credentials object for this provider, e.g. { 'propertyId': '123', 'accessToken': '...' }"
            value={credentialsText}
            onChange={(e) => setCredentialsText(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Connecting...' : 'Connect'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
