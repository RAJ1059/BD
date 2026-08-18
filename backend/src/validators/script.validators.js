import { body, param } from 'express-validator'
import { SCRIPT_PROVIDERS, SCRIPT_PLACEMENTS } from '../config/constants.js'

export const createScriptValidator = [
  body('name').isString().trim().notEmpty(),
  body('provider').isIn(SCRIPT_PROVIDERS),
  body('placement').isIn(SCRIPT_PLACEMENTS),
  body('code').isString().notEmpty(),
  body('isActive').optional().isBoolean(),
  body('targetPages').optional().isArray(),
  body('targetPages.*').optional().isString(),
  body('scheduleStart').optional({ nullable: true }).isISO8601(),
  body('scheduleEnd').optional({ nullable: true }).isISO8601(),
]

export const updateScriptValidator = [param('id').isMongoId(), ...createScriptValidator.map((rule) => rule.optional())]

export const scriptIdValidator = [param('id').isMongoId()]
