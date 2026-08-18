import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Redirect } from '../models/Redirect.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listRedirects = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 })

  const filter = {}
  if (req.query.search) {
    filter.$or = [{ fromPath: { $regex: req.query.search, $options: 'i' } }, { toPath: { $regex: req.query.search, $options: 'i' } }]
  }

  const [items, total] = await Promise.all([
    Redirect.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Redirect.countDocuments(filter),
  ])

  return ok(res, items, 'Redirects', buildMeta({ page, limit, total }))
})

export const getRedirect = catchAsync(async (req, res) => {
  const redirect = await Redirect.findById(req.params.id)
  if (!redirect) throw ApiError.notFound('Redirect not found')
  return ok(res, redirect, 'Redirect')
})

export const createRedirect = catchAsync(async (req, res) => {
  const existing = await Redirect.findOne({ fromPath: req.body.fromPath })
  if (existing) throw ApiError.conflict('A redirect for this path already exists')

  const redirect = await Redirect.create({ ...req.body, createdBy: req.user._id })

  await recordActivity(req, { action: 'create', module: 'redirects', targetId: redirect._id, description: `Created redirect ${redirect.fromPath} -> ${redirect.toPath}` })
  return created(res, redirect, 'Redirect created')
})

export const updateRedirect = catchAsync(async (req, res) => {
  const redirect = await Redirect.findById(req.params.id)
  if (!redirect) throw ApiError.notFound('Redirect not found')

  if (req.body.fromPath && req.body.fromPath !== redirect.fromPath) {
    const existing = await Redirect.findOne({ fromPath: req.body.fromPath, _id: { $ne: redirect._id } })
    if (existing) throw ApiError.conflict('A redirect for this path already exists')
  }

  Object.assign(redirect, req.body, { updatedBy: req.user._id })
  await redirect.save()

  await recordActivity(req, { action: 'update', module: 'redirects', targetId: redirect._id, description: `Updated redirect ${redirect.fromPath}` })
  return ok(res, redirect, 'Redirect updated')
})

export const deleteRedirect = catchAsync(async (req, res) => {
  const redirect = await Redirect.findById(req.params.id)
  if (!redirect) throw ApiError.notFound('Redirect not found')

  await redirect.deleteOne()

  await recordActivity(req, { action: 'delete', module: 'redirects', targetId: redirect._id, description: `Deleted redirect ${redirect.fromPath}` })
  return noContent(res, 'Redirect deleted')
})
