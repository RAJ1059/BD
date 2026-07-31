import { body, param } from 'express-validator'

export const createProjectValidator = [
  body('name').isString().trim().notEmpty(),
  body('client').isMongoId(),
  body('budget').optional().isNumeric(),
  body('deadline').optional().isISO8601(),
  body('assignedTeam').optional().isArray(),
  body('assignedTeam.*').optional().isMongoId(),
]

export const updateProjectValidator = [
  param('id').isMongoId(),
  body('name').optional().isString().trim().notEmpty(),
  body('status').optional().isIn(['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  body('budget').optional().isNumeric(),
  body('deadline').optional().isISO8601(),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('assignedTeam').optional().isArray(),
]

export const projectIdValidator = [param('id').isMongoId()]
