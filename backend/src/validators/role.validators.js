import { body, param } from 'express-validator'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '../config/constants.js'

export const createRoleValidator = [
  body('name').isString().trim().notEmpty().withMessage('Role name is required'),
  body('description').optional().isString(),
  body('permissions').optional().isArray(),
  body('permissions.*.module').optional().isIn(PERMISSION_MODULES),
  body('permissions.*.actions').optional().isArray(),
  body('permissions.*.actions.*').optional().isIn(PERMISSION_ACTIONS),
]

export const updateRoleValidator = [param('id').isMongoId(), ...createRoleValidator.map((rule) => rule.optional())]

export const roleIdValidator = [param('id').isMongoId()]
