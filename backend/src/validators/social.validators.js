import { body, param } from 'express-validator'
import { SOCIAL_PLATFORMS } from '../config/constants.js'

export const platformParamValidator = [param('platform').isIn(SOCIAL_PLATFORMS)]

export const upsertSocialLinkValidator = [
  param('platform').isIn(SOCIAL_PLATFORMS),
  body('url').isURL(),
  body('isActive').optional().isBoolean(),
  body('apiConnected').optional().isBoolean(),
]
