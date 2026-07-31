import { body, param } from 'express-validator'
import { LEAD_SOURCES, LEAD_STATUSES } from '../config/constants.js'

export const createLeadValidator = [
  body('companyName').isString().trim().notEmpty(),
  body('contactPerson').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('whatsapp').optional().isString(),
  body('website').optional().isString(),
  body('industry').optional().isString(),
  body('country').optional().isString(),
  body('address').optional().isString(),
  body('source').optional().isIn(LEAD_SOURCES),
  body('estimatedValue').optional().isNumeric(),
  body('assignedTo').optional().isMongoId(),
]

export const updateLeadValidator = [param('id').isMongoId(), ...createLeadValidator.map((rule) => rule.optional())]

export const updateLeadStatusValidator = [param('id').isMongoId(), body('status').isIn(LEAD_STATUSES), body('lostReason').optional().isString()]

export const addLeadNoteValidator = [param('id').isMongoId(), body('text').isString().trim().notEmpty()]

export const leadIdValidator = [param('id').isMongoId()]
