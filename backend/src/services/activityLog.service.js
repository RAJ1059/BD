import { ActivityLog } from '../models/ActivityLog.js'
import { logger } from '../config/logger.js'

export async function recordActivity(req, { action, module, targetId = null, description = '', changes = null }) {
  try {
    await ActivityLog.create({
      actor: req.user?._id || null,
      actorName: req.user?.name || 'System',
      action,
      module,
      targetId,
      description,
      changes,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    })
  } catch (err) {
    // Audit logging must never break the primary request flow.
    logger.error(`Failed to record activity log: ${err.message}`)
  }
}
