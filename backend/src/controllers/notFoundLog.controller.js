import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, noContent } from '../utils/ApiResponse.js'
import { NotFoundLog } from '../models/NotFoundLog.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listNotFoundLogs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 })
  const sort = req.query.sort || '-hitCount'

  const [items, total] = await Promise.all([
    NotFoundLog.find().sort(sort).skip(skip).limit(limit),
    NotFoundLog.countDocuments(),
  ])

  return ok(res, items, '404 logs', buildMeta({ page, limit, total }))
})

export const deleteNotFoundLog = catchAsync(async (req, res) => {
  const log = await NotFoundLog.findById(req.params.id)
  if (!log) throw ApiError.notFound('Log entry not found')

  await log.deleteOne()

  await recordActivity(req, { action: 'delete', module: 'seo', targetId: log._id, description: `Deleted 404 log for ${log.path}` })
  return noContent(res, '404 log deleted')
})
