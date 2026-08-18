import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, noContent } from '../utils/ApiResponse.js'
import { SocialLink } from '../models/SocialLink.js'
import { SocialClick } from '../models/SocialClick.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listSocialLinks = catchAsync(async (_req, res) => {
  const links = await SocialLink.find().sort('platform')
  return ok(res, links, 'Social links')
})

export const upsertSocialLink = catchAsync(async (req, res) => {
  const { platform } = req.params

  const link = await SocialLink.findOneAndUpdate(
    { platform },
    { ...req.body, platform, updatedBy: req.user._id },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )

  await recordActivity(req, { action: 'update', module: 'social', targetId: link._id, description: `Updated social link for "${platform}"` })
  return ok(res, link, 'Social link saved')
})

export const deleteSocialLink = catchAsync(async (req, res) => {
  const link = await SocialLink.findOne({ platform: req.params.platform })
  if (!link) throw ApiError.notFound('Social link not found')

  await link.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'social', targetId: link._id, description: `Deleted social link for "${link.platform}"` })
  return noContent(res, 'Social link deleted')
})

export const socialAnalytics = catchAsync(async (_req, res) => {
  const links = await SocialLink.find().select('platform clickCount isActive')
  const totalClicks = links.reduce((sum, l) => sum + l.clickCount, 0)

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const last30Days = await SocialClick.aggregate([
    { $match: { clickedAt: { $gte: since } } },
    { $group: { _id: '$platform', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
  ])

  return ok(res, { totalClicks, byPlatform: links, last30Days }, 'Social analytics')
})
