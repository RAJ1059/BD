import { Integration } from '../../models/Integration.js'
import { fetchGa4Summary } from './ga4.service.js'

// Only google_analytics is wired with a real fetcher today. The remaining
// INTEGRATION_PROVIDERS intentionally have no entry yet — fetchIntegrationReport
// reports that gracefully rather than throwing.
export const INTEGRATION_FETCHERS = {
  google_analytics: fetchGa4Summary,
}

export async function fetchIntegrationReport(provider) {
  const doc = await Integration.findOne({ provider })

  if (!doc || !doc.isConnected) {
    return { available: false, reason: 'Not connected' }
  }

  const fetcher = INTEGRATION_FETCHERS[provider]
  if (!fetcher) {
    return { available: false, reason: 'Reporting for this provider is not implemented yet' }
  }

  try {
    const data = await fetcher(doc.credentials)
    doc.lastSyncedAt = new Date()
    doc.lastError = ''
    await doc.save()
    return { available: true, data }
  } catch (err) {
    doc.lastError = err.message
    await doc.save()
    return { available: false, reason: err.message }
  }
}
