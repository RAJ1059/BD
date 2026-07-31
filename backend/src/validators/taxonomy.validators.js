import { body, param } from 'express-validator'

export const createCategoryValidator = [body('name').isString().trim().notEmpty(), body('description').optional().isString(), body('parent').optional().isMongoId()]
export const updateCategoryValidator = [param('id').isMongoId(), ...createCategoryValidator.map((rule) => rule.optional())]

export const createTagValidator = [body('name').isString().trim().notEmpty()]
export const updateTagValidator = [param('id').isMongoId(), body('name').isString().trim().notEmpty()]

export const idValidator = [param('id').isMongoId()]
