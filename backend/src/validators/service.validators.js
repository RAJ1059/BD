import { body, param } from 'express-validator'

export const createServiceValidator = [
  body('title').isString().trim().notEmpty(),
  body('icon').optional().isString(),
  body('summary').optional().isString(),
  body('description').optional().isString(),
  body('features').optional().isArray(),
  body('benefits').optional().isArray(),
  body('order').optional().isInt(),
  body('isActive').optional().isBoolean(),
]

export const updateServiceValidator = [param('id').isMongoId(), ...createServiceValidator.map((rule) => rule.optional())]

export const serviceIdValidator = [param('id').isMongoId()]

export const reorderServicesValidator = [
  body('order').isArray({ min: 1 }),
  body('order.*').isMongoId(),
]
