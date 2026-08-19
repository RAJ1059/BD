import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Service } from '../models/Service.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listServices = catchAsync(async (_req, res) => {
  const items = await Service.find().sort('order title')
  return ok(res, items, 'Services')
})

export const getService = catchAsync(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw ApiError.notFound('Service not found')
  return ok(res, service, 'Service')
})

export const createService = catchAsync(async (req, res) => {
  const { title } = req.body
  const slug = await generateUniqueSlug(Service, title)
  const count = await Service.countDocuments()

  const service = await Service.create({ ...req.body, slug, order: req.body.order ?? count })

  await recordActivity(req, { action: 'create', module: 'services', targetId: service._id, description: `Created service "${service.title}"` })
  return created(res, service, 'Service created')
})

export const updateService = catchAsync(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw ApiError.notFound('Service not found')

  const { title } = req.body
  if (title !== undefined && title !== service.title) {
    service.title = title
    service.slug = await generateUniqueSlug(Service, title, { excludeId: service._id })
  }

  const assignable = ['icon', 'summary', 'description', 'features', 'benefits', 'order', 'isActive']
  for (const field of assignable) {
    if (req.body[field] !== undefined) service[field] = req.body[field]
  }

  await service.save()

  await recordActivity(req, { action: 'update', module: 'services', targetId: service._id, description: `Updated service "${service.title}"` })
  return ok(res, service, 'Service updated')
})

export const deleteService = catchAsync(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) throw ApiError.notFound('Service not found')

  await service.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'services', targetId: service._id, description: `Deleted service "${service.title}"` })
  return noContent(res, 'Service deleted')
})

export const reorderServices = catchAsync(async (req, res) => {
  const { order } = req.body
  await Promise.all(order.map((id, index) => Service.updateOne({ _id: id }, { order: index })))
  await recordActivity(req, { action: 'update', module: 'services', description: 'Reordered services' })
  return ok(res, null, 'Services reordered')
})
