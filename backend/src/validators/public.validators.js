import { body, param } from 'express-validator'

export const contactLeadValidator = [
  body('companyName').optional().isString().trim(),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional().isString(),
  body('whatsapp').optional().isString(),
  body('website').optional().isString(),
  body('message').optional().isString(),
  body('service').optional().isString(),
]

export const publicCommentValidator = [
  param('slug').isString().notEmpty(),
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').isString().trim().notEmpty().isLength({ max: 2000 }),
]
