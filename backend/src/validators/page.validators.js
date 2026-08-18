import { body, param } from 'express-validator'
import { PAGE_STATUSES } from '../config/constants.js'

export const createPageValidator = [
  body('title').isString().trim().notEmpty(),
  body('content').isString().trim().notEmpty(),
  body('template').optional().isString(),
  body('featuredImage').optional().isMongoId(),
  body('status').optional().isIn(PAGE_STATUSES),
  body('scheduledAt').optional().isISO8601(),
  body('seo').optional().isObject(),
]

export const updatePageValidator = [param('id').isMongoId(), ...createPageValidator.map((rule) => rule.optional())]

export const pageIdValidator = [param('id').isMongoId()]
