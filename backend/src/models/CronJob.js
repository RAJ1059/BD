import mongoose from 'mongoose'

const cronJobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    schedule: { type: String, required: true }, // cron expression, e.g. '0 * * * *'
    taskKey: { type: String, required: true }, // key into services/cronScheduler.service.js TASK_REGISTRY
    isActive: { type: Boolean, default: true },
    lastRunAt: { type: Date, default: null },
    lastStatus: { type: String, enum: ['success', 'failed', null], default: null },
    lastError: { type: String, default: '' },
  },
  { timestamps: true }
)

export const CronJob = mongoose.model('CronJob', cronJobSchema)
