import { body, param } from 'express-validator'
import { REDIRECT_TYPES } from '../config/constants.js'

export const createRedirectValidator = [
  body('fromPath').isString().trim().notEmpty(),
  body('toPath').isString().trim().notEmpty(),
  body('statusCode').optional().isIn(REDIRECT_TYPES),
  body('isActive').optional().isBoolean(),
]

export const updateRedirectValidator = [param('id').isMongoId(), ...createRedirectValidator.map((rule) => rule.optional())]

export const redirectIdValidator = [param('id').isMongoId()]
