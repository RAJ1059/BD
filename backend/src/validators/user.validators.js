import { body, param } from 'express-validator'

export const createUserValidator = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Password must be at least 8 characters and include upper, lower, and a number'),
  body('role').isMongoId().withMessage('A valid role is required'),
  body('phone').optional().isString(),
]

export const updateUserValidator = [
  param('id').isMongoId(),
  body('name').optional().isString().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isMongoId(),
  body('phone').optional().isString(),
  body('isActive').optional().isBoolean(),
]

export const userIdValidator = [param('id').isMongoId()]
