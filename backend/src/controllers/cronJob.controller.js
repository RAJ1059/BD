import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/ApiResponse.js'
import { CronJob } from '../models/CronJob.js'
import { TASK_REGISTRY } from '../services/cronScheduler.service.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listCronJobs = catchAsync(async (_req, res) => {
  const jobs = await CronJob.find().sort('name')
  return ok(res, jobs, 'Cron jobs')
})

// NOTE: toggling isActive or changing the schedule here only takes effect
// after the server restarts (see services/cronScheduler.service.js) —
// this implementation does not hot-reload already-running node-cron tasks.
export const updateCronJob = catchAsync(async (req, res) => {
  const job = await CronJob.findById(req.params.id)
  if (!job) throw ApiError.notFound('Cron job not found')

  const { schedule, isActive } = req.body
  if (schedule !== undefined) job.schedule = schedule
  if (isActive !== undefined) job.isActive = isActive
  await job.save()

  await recordActivity(req, { action: 'update', module: 'settings', targetId: job._id, description: `Updated cron job "${job.name}" (restart required to apply)` })
  return ok(res, job, 'Cron job updated — restart the server to apply schedule/active changes')
})

export const runCronJobNow = catchAsync(async (req, res) => {
  const job = await CronJob.findById(req.params.id)
  if (!job) throw ApiError.notFound('Cron job not found')

  const task = TASK_REGISTRY[job.taskKey]
  if (!task) throw ApiError.badRequest(`No task registered for taskKey "${job.taskKey}"`)

  try {
    await task()
    job.lastRunAt = new Date()
    job.lastStatus = 'success'
    job.lastError = ''
    await job.save()
  } catch (err) {
    job.lastRunAt = new Date()
    job.lastStatus = 'failed'
    job.lastError = err.message
    await job.save()
    throw ApiError.internal(`Task failed: ${err.message}`)
  }

  await recordActivity(req, { action: 'view', module: 'settings', targetId: job._id, description: `Manually ran cron job "${job.name}"` })
  return ok(res, job, 'Cron job executed')
})
