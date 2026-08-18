import { param } from 'express-validator'

export const notFoundLogIdValidator = [param('id').isMongoId()]
