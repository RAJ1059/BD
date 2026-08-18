import mongoose from 'mongoose'

const notFoundLogSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, index: true },
    referrer: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    hitCount: { type: Number, default: 1 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

notFoundLogSchema.statics.record = async function record(path, { referrer = '', userAgent = '', ip = '' } = {}) {
  return this.findOneAndUpdate(
    { path },
    { $inc: { hitCount: 1 }, $set: { lastSeenAt: new Date(), referrer, userAgent, ip } },
    { upsert: true, new: true }
  )
}

export const NotFoundLog = mongoose.model('NotFoundLog', notFoundLogSchema)
