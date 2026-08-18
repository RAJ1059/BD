import { Job } from '../models/Job.js'
import { sendEmail } from './email.service.js'
import { logger } from '../config/logger.js'

// Registry of job type -> handler. Other modules can register more handlers
// by importing JOB_HANDLERS and assigning to a new key.
//
// NOTE: this is an intentionally simple, in-process, single-instance job
// queue. A real deployment running multiple app instances would need a
// distributed queue (e.g. Redis/BullMQ) so jobs aren't claimed twice and
// processing survives a single instance restarting.
export const JOB_HANDLERS = {}

JOB_HANDLERS['send-email'] = async ({ to, subject, html }) => sendEmail({ to, subject, html })

export async function enqueueJob(type, payload) {
  return Job.create({ type, payload, status: 'pending' })
}

export async function processNextJob() {
  const job = await Job.findOneAndUpdate(
    { status: 'pending' },
    { status: 'processing' },
    { sort: { createdAt: 1 }, new: true }
  )
  if (!job) return null

  const handler = JOB_HANDLERS[job.type]
  if (!handler) {
    job.status = 'failed'
    job.lastError = `No handler registered for job type "${job.type}"`
    await job.save()
    return job
  }

  try {
    const result = await handler(job.payload)
    job.status = 'completed'
    job.result = result ?? null
    await job.save()
  } catch (err) {
    job.attempts += 1
    job.lastError = err.message
    job.status = job.attempts < job.maxAttempts ? 'pending' : 'failed'
    await job.save()
  }

  return job
}

// Simple in-process polling loop. One bad job/tick is caught and logged so
// the interval keeps running.
export function startJobWorker() {
  const interval = setInterval(async () => {
    try {
      await processNextJob()
    } catch (err) {
      logger.error(`Job worker tick failed: ${err.message}`)
    }
  }, 5000)
  return interval
}
