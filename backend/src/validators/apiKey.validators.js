import { body, param } from 'express-validator'

export const createApiKeyValidator = [
  body('name').isString().trim().notEmpty(),
  body('scopes').optional().isArray(),
  body('expiresAt').optional().isISO8601(),
]

export const apiKeyIdValidator = [param('id').isMongoId()]
