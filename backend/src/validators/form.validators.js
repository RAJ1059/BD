import { body, param } from 'express-validator'
import { FORM_FIELD_TYPES } from '../config/constants.js'

export const createFormValidator = [
  body('name').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('fields').isArray({ min: 1 }),
  body('fields.*.label').isString().notEmpty(),
  body('fields.*.name').isString().notEmpty(),
  body('fields.*.type').isIn(FORM_FIELD_TYPES),
  body('fields.*.required').optional().isBoolean(),
  body('fields.*.options').optional().isArray(),
  body('notificationEmails').optional().isArray(),
  body('successMessage').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('allowFileUpload').optional().isBoolean(),
]

export const updateFormValidator = [param('id').isMongoId(), ...createFormValidator.map((rule) => rule.optional())]

export const formIdValidator = [param('id').isMongoId()]
