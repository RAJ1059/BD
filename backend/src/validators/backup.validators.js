import { param } from 'express-validator'

export const backupFileNameValidator = [param('fileName').isString().trim().notEmpty()]
