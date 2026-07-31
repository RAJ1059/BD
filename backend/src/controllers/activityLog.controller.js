import { catchAsync } from '../utils/catchAsync.js'
import { ok } from '../utils/ApiResponse.js'
import { ActivityLog } from '../models/ActivityLog.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listActivityLogs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 25 })

  const filter = {}
  if (req.query.module) filter.module = req.query.module
  if (req.query.actor) filter.actor = req.query.actor
  if (req.query.action) filter.action = req.query.action
  if (req.query.from || req.query.to) {
    filter.createdAt = {}
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from)
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to)
  }

  const [items, total] = await Promise.all([
    ActivityLog.find(filter).populate('actor', 'name email avatar').sort('-createdAt').skip(skip).limit(limit),
    ActivityLog.countDocuments(filter),
  ])

  return ok(res, items, 'Activity logs', buildMeta({ page, limit, total }))
})

export const recentActivity = catchAsync(async (_req, res) => {
  const items = await ActivityLog.find().populate('actor', 'name avatar').sort('-createdAt').limit(10)
  return ok(res, items, 'Recent activity')
})
