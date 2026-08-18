import cron from 'node-cron'
import { CronJob } from '../models/CronJob.js'
import { publishDuePosts } from '../controllers/public.controller.js'
import { logger } from '../config/logger.js'

// RefreshToken already has a TTL index (`expireAfterSeconds: 0` on
// `expiresAt`, see models/RefreshToken.js) so MongoDB itself deletes expired
// refresh tokens automatically. This task is a documented no-op rather than
// duplicating that cleanup.
async function cleanupExpiredRefreshTokens() {
  logger.info('cleanupExpiredRefreshTokens: no-op, expired tokens are removed by the TTL index on RefreshToken.expiresAt')
}

// taskKey -> async function. Register additional tasks here as needed.
export const TASK_REGISTRY = {
  publishDuePosts,
  cleanupExpiredRefreshTokens,
}

const DEFAULT_JOBS = [
  { name: 'publishDuePosts', schedule: '*/5 * * * *', taskKey: 'publishDuePosts' },
  { name: 'cleanupExpiredRefreshTokens', schedule: '0 3 * * *', taskKey: 'cleanupExpiredRefreshTokens' },
]

async function seedDefaultJobs() {
  const count = await CronJob.countDocuments()
  if (count > 0) return
  await CronJob.insertMany(DEFAULT_JOBS)
}

// Reads active CronJob docs from the DB and schedules each with node-cron.
// NOTE: this is a simple one-shot scheduler run at process startup — changing
// a job's schedule via the API takes effect only after the server restarts.
export async function startScheduler() {
  await seedDefaultJobs()

  const jobs = await CronJob.find({ isActive: true })
  for (const job of jobs) {
    const task = TASK_REGISTRY[job.taskKey]
    if (!task) {
      logger.error(`No task registered for cron job "${job.name}" (taskKey: ${job.taskKey})`)
      continue
    }

    if (!cron.validate(job.schedule)) {
      logger.error(`Invalid cron schedule "${job.schedule}" for job "${job.name}", skipping`)
      continue
    }

    cron.schedule(job.schedule, async () => {
      try {
        await task()
        await CronJob.updateOne({ _id: job._id }, { lastRunAt: new Date(), lastStatus: 'success', lastError: '' })
      } catch (err) {
        logger.error(`Cron job "${job.name}" failed: ${err.message}`)
        await CronJob.updateOne({ _id: job._id }, { lastRunAt: new Date(), lastStatus: 'failed', lastError: err.message })
      }
    })
  }

  logger.info(`Cron scheduler started with ${jobs.length} active job(s)`)
}
