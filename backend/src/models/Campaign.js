import mongoose from 'mongoose'

// Appends the utm_* query params to baseUrl, using the built-in URL parser so
// existing query strings (baseUrl already containing "?") are handled
// correctly instead of hand-rolled string concatenation.
export function buildUtmUrl(baseUrl, { utmSource, utmMedium, utmCampaign, utmTerm, utmContent }) {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', utmSource)
  url.searchParams.set('utm_medium', utmMedium)
  url.searchParams.set('utm_campaign', utmCampaign)
  if (utmTerm) url.searchParams.set('utm_term', utmTerm)
  if (utmContent) url.searchParams.set('utm_content', utmContent)
  return url.toString()
}

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    baseUrl: { type: String, required: true, trim: true },
    utmSource: { type: String, required: true, trim: true },
    utmMedium: { type: String, required: true, trim: true },
    utmCampaign: { type: String, required: true, trim: true },
    utmTerm: { type: String, default: '' },
    utmContent: { type: String, default: '' },
    generatedUrl: { type: String, required: true },
    shortCode: { type: String, unique: true, sparse: true, index: true },
    qrCodeDataUrl: { type: String, default: '' },
    clickCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Campaign = mongoose.model('Campaign', campaignSchema)
