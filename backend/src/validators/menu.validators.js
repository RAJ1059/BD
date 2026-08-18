import { body, param } from 'express-validator'
import { MENU_LOCATIONS } from '../config/constants.js'

export const createMenuValidator = [
  body('name').isString().trim().notEmpty(),
  body('location').isIn(MENU_LOCATIONS),
  body('isActive').optional().isBoolean(),
  body('items').optional().isArray(),
  body('items.*.label').optional().isString().trim().notEmpty(),
  body('items.*.url').optional().isString(),
  body('items.*.page').optional().isMongoId(),
  body('items.*.order').optional().isInt(),
  body('items.*.target').optional().isIn(['_self', '_blank']),
  body('items.*.icon').optional().isString(),
  body('items.*.parent').optional().isMongoId(),
]

export const updateMenuValidator = [param('id').isMongoId(), ...createMenuValidator.map((rule) => rule.optional())]

export const menuIdValidator = [param('id').isMongoId()]
