import { body, param } from 'express-validator'
import { TASK_STATUSES, TASK_PRIORITIES } from '../config/constants.js'

export const createTaskValidator = [
  body('title').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('status').optional().isIn(TASK_STATUSES),
  body('priority').optional().isIn(TASK_PRIORITIES),
  body('dueDate').optional().isISO8601(),
  body('assignedTo').optional().isMongoId(),
  body('relatedLead').optional().isMongoId(),
  body('relatedClient').optional().isMongoId(),
  body('relatedProject').optional().isMongoId(),
]

export const updateTaskValidator = [param('id').isMongoId(), ...createTaskValidator.map((rule) => rule.optional())]

export const taskIdValidator = [param('id').isMongoId()]
