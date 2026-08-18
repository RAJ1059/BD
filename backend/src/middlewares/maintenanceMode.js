import { Setting } from '../models/Setting.js'

// Gates the public-facing website reads (e.g. /api/public/*) when
// maintenanceMode is enabled in Settings. Never applied to /api/auth or the
// admin panel itself, so admins can always sign in and manage the site.
export async function maintenanceModeGate(req, res, next) {
  if (req.path.startsWith('/auth')) return next()

  try {
    const settings = await Setting.getSingleton()
    if (settings?.maintenanceMode) {
      return res.status(503).json({ success: false, message: settings.maintenanceMessage })
    }
    return next()
  } catch {
    // A settings lookup failure should never take down the public site.
    return next()
  }
}
