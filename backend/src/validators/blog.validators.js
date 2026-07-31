import { body, param } from 'express-validator'
import { BLOG_STATUSES } from '../config/constants.js'

export const createBlogValidator = [
  body('title').isString().trim().notEmpty(),
  body('content').isString().trim().notEmpty(),
  body('excerpt').optional().isString(),
  body('category').optional().isMongoId(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isMongoId(),
  body('featuredImage').optional().isMongoId(),
  body('gallery').optional().isArray(),
  body('status').optional().isIn(BLOG_STATUSES),
  body('scheduledAt').optional().isISO8601(),
  body('isFeatured').optional().isBoolean(),
  body('seo').optional().isObject(),
]

export const updateBlogValidator = [param('id').isMongoId(), ...createBlogValidator.map((rule) => rule.optional())]

export const blogIdValidator = [param('id').isMongoId()]

export const addCommentValidator = [
  param('slug').isString().notEmpty(),
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').isString().trim().notEmpty(),
]
