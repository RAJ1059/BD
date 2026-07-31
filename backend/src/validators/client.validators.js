import { body, param } from 'express-validator'

export const createClientValidator = [
  body('companyName').isString().trim().notEmpty(),
  body('contactPerson').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('whatsapp').optional().isString(),
  body('website').optional().isString(),
  body('industry').optional().isString(),
  body('country').optional().isString(),
  body('address').optional().isString(),
  body('accountManager').optional().isMongoId(),
]

export const updateClientValidator = [param('id').isMongoId(), ...createClientValidator.map((rule) => rule.optional())]

export const clientIdValidator = [param('id').isMongoId()]
