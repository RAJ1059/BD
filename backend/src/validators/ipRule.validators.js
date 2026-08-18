import { body, param } from 'express-validator'

export const createIpRuleValidator = [
  body('ip').isString().trim().notEmpty(),
  body('type').isIn(['allow', 'block']),
  body('note').optional().isString(),
]

export const ipRuleIdValidator = [param('id').isMongoId()]
