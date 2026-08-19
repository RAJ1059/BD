import { body, param } from 'express-validator'
import { INTEGRATION_PROVIDERS } from '../config/constants.js'

export const providerParamValidator = [param('provider').isIn(INTEGRATION_PROVIDERS)]

export const connectIntegrationValidator = [param('provider').isIn(INTEGRATION_PROVIDERS), body().isObject()]

export const updateSiteValidator = [param('provider').isIn(INTEGRATION_PROVIDERS), body('siteUrl').isString().trim().notEmpty()]
