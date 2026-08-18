import { body, param } from 'express-validator'

export const createWebhookValidator = [
  body('name').isString().notEmpty(),
  body('url').isURL(),
  body('events').isArray({ min: 1 }),
  body('secret').optional().isString(),
]

export const updateWebhookValidator = [
  param('id').isMongoId(),
  body('name').optional().isString().notEmpty(),
  body('url').optional().isURL(),
  body('events').optional().isArray({ min: 1 }),
  body('secret').optional().isString(),
  body('isActive').optional().isBoolean(),
]

export const webhookIdValidator = [param('id').isMongoId()]
