import { useEffect, useState, useCallback } from 'react'
import { FiSave, FiImage } from 'react-icons/fi'
import PageHeader, { PrimaryButton, SecondaryButton, Banner } from '../../components/admin/PageHeader'
import { TextInput, TextArea, Checkbox } from '../../components/admin/FormField'
import MediaPickerModal from '../../components/admin/MediaPickerModal'
import { settingsApi } from '../../api/settings'
import { ApiError } from '../../lib/api'

const emptyForm = {
  siteName: '',
  logo: null,
  favicon: null,
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  smtp: { host: '', port: '', secure: false, user: '', pass: '', from: '' },
  maintenanceMode: false,
  maintenanceMessage: '',
  robotsTxt: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [picker, setPicker] = useState(null) // 'logo' | 'favicon' | null

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await settingsApi.get()
      const s = res.data
      setForm({
        siteName: s.siteName || '',
        logo: s.logo || null,
        favicon: s.favicon || null,
        contactEmail: s.contactEmail || '',
        contactPhone: s.contactPhone || '',
        contactAddress: s.contactAddress || '',
        smtp: {
          host: s.smtp?.host || '',
          port: s.smtp?.port ?? '',
          secure: s.smtp?.secure || false,
          user: s.smtp?.user || '',
          pass: s.smtp?.pass || '',
          from: s.smtp?.from || '',
        },
        maintenanceMode: s.maintenanceMode || false,
        maintenanceMessage: s.maintenanceMessage || '',
        robotsTxt: s.robotsTxt || '',
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await settingsApi.update({
        siteName: form.siteName,
        logo: form.logo?._id || null,
        favicon: form.favicon?._id || null,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        contactAddress: form.contactAddress,
        smtp: {
          ...form.smtp,
          port: form.smtp.port === '' ? null : Number(form.smtp.port),
        },
        maintenanceMode: form.maintenanceMode,
        maintenanceMessage: form.maintenanceMessage,
        robotsTxt: form.robotsTxt,
      })
      setSuccess('Settings saved')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[#8B93A7]">Loading...</p>

  return (
    <div>
      <PageHeader title="Settings" description="Site-wide configuration for branding, contact info, mail and SEO." />
      {error && <Banner>{error}</Banner>}
      {success && <Banner tone="success">{success}</Banner>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">General</h3>
          <div className="space-y-4">
            <TextInput label="Site name" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Contact email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
              <TextInput
                label="Contact phone"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              />
            </div>
            <TextArea
              label="Contact address"
              rows={2}
              value={form.contactAddress}
              onChange={(e) => setForm({ ...form, contactAddress: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Branding</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-[#8B93A7]">Logo</p>
              {form.logo ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                  <img src={form.logo.thumbnailUrl || form.logo.url} alt="" className="h-32 w-full object-cover" />
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-[#5B6478]">
                  <FiImage size={24} />
                </div>
              )}
              <SecondaryButton type="button" onClick={() => setPicker('logo')} className="w-full justify-center">
                Choose logo
              </SecondaryButton>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[#8B93A7]">Favicon</p>
              {form.favicon ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                  <img src={form.favicon.thumbnailUrl || form.favicon.url} alt="" className="h-32 w-full object-cover" />
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-[#5B6478]">
                  <FiImage size={24} />
                </div>
              )}
              <SecondaryButton type="button" onClick={() => setPicker('favicon')} className="w-full justify-center">
                Choose favicon
              </SecondaryButton>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">SMTP</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="Host"
                value={form.smtp.host}
                onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, host: e.target.value } })}
              />
              <TextInput
                label="Port"
                type="number"
                value={form.smtp.port}
                onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, port: e.target.value } })}
              />
            </div>
            <Checkbox
              label="Use secure connection (TLS)"
              checked={form.smtp.secure}
              onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, secure: e.target.checked } })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                label="User"
                value={form.smtp.user}
                onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, user: e.target.value } })}
              />
              <TextInput
                label="Password"
                type="password"
                value={form.smtp.pass}
                onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, pass: e.target.value } })}
              />
            </div>
            <TextInput
              label="From address"
              value={form.smtp.from}
              onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, from: e.target.value } })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Maintenance mode</h3>
          <div className="space-y-4">
            <Checkbox
              label="Enable maintenance mode"
              checked={form.maintenanceMode}
              onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
            />
            {form.maintenanceMode && (
              <TextArea
                label="Maintenance message"
                rows={3}
                value={form.maintenanceMessage}
                onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#141928] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">SEO</h3>
          <TextArea label="robots.txt" rows={6} value={form.robotsTxt} onChange={(e) => setForm({ ...form, robotsTxt: e.target.value })} />
        </div>

        <div className="flex justify-end">
          <PrimaryButton type="submit" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save changes'}
          </PrimaryButton>
        </div>
      </form>

      <MediaPickerModal
        open={Boolean(picker)}
        onClose={() => setPicker(null)}
        onSelect={(media) => {
          setForm((f) => ({ ...f, [picker]: media }))
          setPicker(null)
        }}
      />
    </div>
  )
}
