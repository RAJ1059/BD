import { param } from 'express-validator'

export const jobIdValidator = [param('id').isMongoId()]
