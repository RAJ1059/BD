import { body, param } from 'express-validator'

export const updateCronJobValidator = [
  param('id').isMongoId(),
  body('schedule').optional().isString().trim().notEmpty(),
  body('isActive').optional().isBoolean(),
]

export const cronJobIdValidator = [param('id').isMongoId()]
