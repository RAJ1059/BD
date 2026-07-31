import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorName: { type: String, default: 'System' },
    action: { type: String, required: true }, // e.g. "create", "update", "delete", "login"
    module: { type: String, required: true, index: true }, // e.g. "leads", "blogs"
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, default: '' },
    changes: { type: mongoose.Schema.Types.Mixed, default: null }, // { before, after } diff
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
)

activityLogSchema.index({ module: 1, createdAt: -1 })

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)
