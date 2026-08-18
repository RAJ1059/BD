import crypto from 'crypto'
import QRCode from 'qrcode'
import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Campaign, buildUtmUrl } from '../models/Campaign.js'
import { CampaignClick } from '../models/CampaignClick.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { env } from '../config/env.js'

const UTM_FIELDS = ['baseUrl', 'utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent']

// Same loop-check-uniqueness pattern as generateUniqueSlug, but for a short
// random code rather than a slugified string.
async function generateUniqueShortCode() {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const code = crypto.randomBytes(5).toString('base64url').slice(0, 7)
    // eslint-disable-next-line no-await-in-loop
    const exists = await Campaign.exists({ shortCode: code })
    if (!exists) return code
  }
}

function pickUtmFields(body) {
  const { baseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body
  return { baseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent }
}

export const listCampaigns = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)

  const filter = {}
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' }

  const [items, total] = await Promise.all([
    Campaign.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Campaign.countDocuments(filter),
  ])

  return ok(res, items, 'Campaigns', buildMeta({ page, limit, total }))
})

export const getCampaign = catchAsync(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
  if (!campaign) throw ApiError.notFound('Campaign not found')
  return ok(res, campaign, 'Campaign')
})

export const createCampaign = catchAsync(async (req, res) => {
  const utmFields = pickUtmFields(req.body)
  const generatedUrl = buildUtmUrl(utmFields.baseUrl, utmFields)

  let shortCode
  if (req.body.useShortLink) shortCode = await generateUniqueShortCode()

  const linkForQrCode = shortCode ? `${env.apiBaseUrl}/api/public/utm/${shortCode}` : generatedUrl
  const qrCodeDataUrl = await QRCode.toDataURL(linkForQrCode)

  const campaign = await Campaign.create({
    name: req.body.name,
    ...utmFields,
    generatedUrl,
    shortCode,
    qrCodeDataUrl,
    createdBy: req.user._id,
  })

  await recordActivity(req, { action: 'create', module: 'utm', targetId: campaign._id, description: `Created UTM campaign "${campaign.name}"` })
  return created(res, campaign, 'Campaign created')
})

export const updateCampaign = catchAsync(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
  if (!campaign) throw ApiError.notFound('Campaign not found')

  const before = campaign.toObject()

  if (req.body.name !== undefined) campaign.name = req.body.name

  const utmChanged = UTM_FIELDS.some((field) => req.body[field] !== undefined && req.body[field] !== campaign[field])
  for (const field of UTM_FIELDS) {
    if (req.body[field] !== undefined) campaign[field] = req.body[field]
  }

  const wantsShortLink = req.body.useShortLink !== undefined ? req.body.useShortLink : Boolean(campaign.shortCode)
  if (wantsShortLink && !campaign.shortCode) {
    campaign.shortCode = await generateUniqueShortCode()
  } else if (!wantsShortLink && campaign.shortCode) {
    campaign.shortCode = undefined
  }

  if (utmChanged || req.body.useShortLink !== undefined) {
    campaign.generatedUrl = buildUtmUrl(campaign.baseUrl, pickUtmFields(campaign))
    const linkForQrCode = campaign.shortCode ? `${env.apiBaseUrl}/api/public/utm/${campaign.shortCode}` : campaign.generatedUrl
    campaign.qrCodeDataUrl = await QRCode.toDataURL(linkForQrCode)
  }

  await campaign.save()

  await recordActivity(req, {
    action: 'update',
    module: 'utm',
    targetId: campaign._id,
    description: `Updated UTM campaign "${campaign.name}"`,
    changes: { before: { name: before.name, generatedUrl: before.generatedUrl }, after: { name: campaign.name, generatedUrl: campaign.generatedUrl } },
  })
  return ok(res, campaign, 'Campaign updated')
})

export const deleteCampaign = catchAsync(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
  if (!campaign) throw ApiError.notFound('Campaign not found')

  await campaign.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'utm', targetId: campaign._id, description: `Deleted UTM campaign "${campaign.name}"` })
  return noContent(res, 'Campaign deleted')
})

export const campaignAnalytics = catchAsync(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
  if (!campaign) throw ApiError.notFound('Campaign not found')

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [timeSeries, topReferrers] = await Promise.all([
    CampaignClick.aggregate([
      { $match: { campaign: campaign._id, clickedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    CampaignClick.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: '$referrer', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 10 },
    ]),
  ])

  return ok(
    res,
    {
      clickCount: campaign.clickCount,
      timeSeries: timeSeries.map((t) => ({ date: t._id, clicks: t.clicks })),
      topReferrers: topReferrers.map((r) => ({ referrer: r._id || '(direct)', clicks: r.clicks })),
    },
    'Campaign analytics'
  )
})
