import { useEffect, useState, useCallback } from 'react'
import { FiLink, FiLink2, FiRefreshCw } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import Modal from '../../components/admin/Modal'
import Badge from '../../components/admin/Badge'
import { TextArea } from '../../components/admin/FormField'
import { integrationsApi } from '../../api/integrations'
import { ApiError } from '../../lib/api'

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

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await integrationsApi.list()
      const byProvider = new Map(res.data.map((item) => [item.provider, item]))
      setRows(INTEGRATION_PROVIDERS.map((provider) => byProvider.get(provider) || { provider, isConnected: false }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openConnect = (provider) => {
    setConnectTarget(provider)
    setCredentialsText('')
    setFormError('')
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
      setConnectTarget(null)
      await load()
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
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to disconnect integration')
    } finally {
      setDisconnectingProvider(null)
    }
  }

  const handleTest = async (provider) => {
    setTestingProvider(provider)
    setError('')
    setSuccess('')
    try {
      await integrationsApi.test(provider)
      setSuccess(`${formatProviderName(provider)} connection test succeeded`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connection test failed')
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
            <div key={row.provider} className="rounded-2xl border border-white/10 bg-[#141928] p-5">
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
                  <PrimaryButton type="button" onClick={() => openConnect(row.provider)}>
                    <FiLink /> Connect
                  </PrimaryButton>
                )}
              </div>
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
