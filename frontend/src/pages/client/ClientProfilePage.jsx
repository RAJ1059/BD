import { useEffect, useState } from 'react'
import PageHeader, { Banner } from '../../components/admin/PageHeader'
import Badge from '../../components/admin/Badge'
import { clientPortalApi } from '../../api/clientPortal'
import { ApiError } from '../../lib/api'

const STATUS_TONES = { active: 'green', inactive: 'neutral', archived: 'red' }

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#5B6478]">{label}</p>
      <p className="mt-1 text-sm text-[#E4E4E7]">{value || '—'}</p>
    </div>
  )
}

export default function ClientProfilePage() {
  const [client, setClient] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await clientPortalApi.profile()
        if (!cancelled) setClient(res.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader title="My Profile" description="Your company details on file." />
      {error && <Banner>{error}</Banner>}

      {loading ? (
        <p className="text-[#8B93A7]">Loading profile...</p>
      ) : (
        client && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{client.companyName}</h3>
                <Badge tone={STATUS_TONES[client.status]}>{client.status}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Contact Person" value={client.contactPerson} />
                <Field label="Email" value={client.email} />
                <Field label="Phone" value={client.phone} />
                <Field label="WhatsApp" value={client.whatsapp} />
                <Field label="Website" value={client.website} />
                <Field label="Industry" value={client.industry} />
                <Field label="Country" value={client.country} />
                <Field label="Address" value={client.address} />
              </div>
            </div>

            {client.accountManager && (
              <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
                <h3 className="mb-2 text-sm font-semibold text-white">Account Manager</h3>
                <p className="text-sm text-[#E4E4E7]">{client.accountManager.name}</p>
                <p className="text-xs text-[#5B6478]">{client.accountManager.email}</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
