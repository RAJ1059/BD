import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

// Runs after an array of express-validator checks and turns failures into
// a single, clean 400 response instead of a raw validator error array.
export function validate(req, _res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }))
  next(ApiError.badRequest('Validation failed', details))
}
