import { body, param } from 'express-validator'

export const createCampaignValidator = [
  body('name').isString().trim().notEmpty(),
  body('baseUrl').isURL(),
  body('utmSource').isString().trim().notEmpty(),
  body('utmMedium').isString().trim().notEmpty(),
  body('utmCampaign').isString().trim().notEmpty(),
  body('utmTerm').optional().isString(),
  body('utmContent').optional().isString(),
  body('useShortLink').optional().isBoolean(),
]

export const updateCampaignValidator = [param('id').isMongoId(), ...createCampaignValidator.map((rule) => rule.optional())]

export const campaignIdValidator = [param('id').isMongoId()]
