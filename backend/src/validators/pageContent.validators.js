import { body, param } from 'express-validator'
import { PAGE_CONTENT_KEYS } from '../config/constants.js'

export const pageKeyValidator = [param('pageKey').isIn(PAGE_CONTENT_KEYS)]

export const updatePageContentValidator = [
  param('pageKey').isIn(PAGE_CONTENT_KEYS),
  body('sections').optional().isObject(),
  body('seo').optional().isObject(),
]
