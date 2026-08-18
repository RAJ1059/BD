import { catchAsync } from '../utils/catchAsync.js'
import { ok } from '../utils/ApiResponse.js'
import { Setting } from '../models/Setting.js'
import { recordActivity } from '../services/activityLog.service.js'

const EDITABLE_FIELDS = [
  'siteName',
  'contactEmail',
  'contactPhone',
  'contactAddress',
  'logo',
  'favicon',
  'smtp',
  'maintenanceMode',
  'maintenanceMessage',
  'robotsTxt',
]

export const getSettings = catchAsync(async (_req, res) => {
  const settings = await Setting.getSingleton()
  await settings.populate(['logo', 'favicon'])
  return ok(res, settings, 'Settings')
})

export const updateSettings = catchAsync(async (req, res) => {
  const settings = await Setting.getSingleton()

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) settings[field] = req.body[field]
  }

  await settings.save()
  await settings.populate(['logo', 'favicon'])

  await recordActivity(req, { action: 'update', module: 'settings', targetId: settings._id, description: 'Updated site settings' })
  return ok(res, settings, 'Settings updated')
})
