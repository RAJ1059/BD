import { body, param } from 'express-validator'

export const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
  body('rememberMe').optional().isBoolean(),
  body('twoFactorCode').optional().isString(),
]

export const forgotPasswordValidator = [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()]

export const resetPasswordValidator = [
  param('token').isString().notEmpty(),
  body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Password must be at least 8 characters and include upper, lower, and a number'),
]

export const changePasswordValidator = [
  body('currentPassword').isString().notEmpty(),
  body('newPassword').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Password must be at least 8 characters and include upper, lower, and a number'),
]

export const verifyTwoFactorValidator = [body('code').isString().isLength({ min: 6, max: 6 }).withMessage('Enter the 6-digit code')]

export const googleLoginValidator = [body('idToken').isString().notEmpty().withMessage('Google idToken is required')]

export const registerValidator = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters and include upper, lower, and a number'),
]
