import { body } from 'express-validator'

export const updateSettingsValidator = [
  body('siteName').optional().isString().trim(),
  body('contactEmail').optional().isString(),
  body('contactPhone').optional().isString(),
  body('contactAddress').optional().isString(),
  body('logo').optional().isMongoId(),
  body('favicon').optional().isMongoId(),
  body('smtp').optional().isObject(),
  body('smtp.host').optional().isString(),
  body('smtp.port').optional().isInt(),
  body('smtp.secure').optional().isBoolean(),
  body('smtp.user').optional().isString(),
  body('smtp.pass').optional().isString(),
  body('smtp.from').optional().isString(),
  body('maintenanceMode').optional().isBoolean(),
  body('maintenanceMessage').optional().isString(),
  body('robotsTxt').optional().isString(),
]
