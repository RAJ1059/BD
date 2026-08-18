import { body, param } from 'express-validator'

export const createMediaFolderValidator = [body('name').isString().trim().notEmpty(), body('parent').optional().isMongoId()]
export const renameMediaFolderValidator = [param('id').isMongoId(), body('name').isString().trim().notEmpty()]
export const mediaFolderIdValidator = [param('id').isMongoId()]
