import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/ApiResponse.js'
import { Job } from '../models/Job.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listJobs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 })

  const filter = {}
  if (req.query.status) filter.status = req.query.status

  const [items, total] = await Promise.all([
    Job.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Job.countDocuments(filter),
  ])

  return ok(res, items, 'Jobs', buildMeta({ page, limit, total }))
})

export const retryJob = catchAsync(async (req, res) => {
  const job = await Job.findById(req.params.id)
  if (!job) throw ApiError.notFound('Job not found')
  if (job.status !== 'failed') throw ApiError.badRequest('Only failed jobs can be retried')

  job.status = 'pending'
  job.attempts = 0
  job.lastError = ''
  await job.save()

  await recordActivity(req, { action: 'update', module: 'settings', targetId: job._id, description: `Retried job "${job.type}"` })
  return ok(res, job, 'Job queued for retry')
})
