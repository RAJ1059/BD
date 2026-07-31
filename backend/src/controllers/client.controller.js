import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Client } from '../models/Client.js'
import { Project } from '../models/Project.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'

export const listClients = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['companyName', 'createdAt'])

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.accountManager) filter.accountManager = req.query.accountManager
  if (req.query.search) filter.$text = { $search: req.query.search }

  const [items, total] = await Promise.all([
    Client.find(filter).populate('accountManager', 'name avatar').sort(sort).skip(skip).limit(limit),
    Client.countDocuments(filter),
  ])

  return ok(res, items, 'Clients', buildMeta({ page, limit, total }))
})

export const getClient = catchAsync(async (req, res) => {
  const client = await Client.findById(req.params.id).populate('accountManager', 'name avatar').populate('attachments.media')
  if (!client) throw ApiError.notFound('Client not found')

  const projects = await Project.find({ client: client._id }).sort('-createdAt')
  return ok(res, { ...client.toObject(), projects }, 'Client')
})

export const createClient = catchAsync(async (req, res) => {
  const client = await Client.create({ ...req.body, createdBy: req.user._id })
  await recordActivity(req, { action: 'create', module: 'clients', targetId: client._id, description: `Created client "${client.companyName}"` })
  return created(res, client, 'Client created')
})

export const updateClient = catchAsync(async (req, res) => {
  const client = await Client.findById(req.params.id)
  if (!client) throw ApiError.notFound('Client not found')

  const before = client.toObject()
  Object.assign(client, req.body)
  await client.save()

  await recordActivity(req, {
    action: 'update',
    module: 'clients',
    targetId: client._id,
    description: `Updated client "${client.companyName}"`,
    changes: { before, after: client.toObject() },
  })
  return ok(res, client, 'Client updated')
})

export const attachClientFile = catchAsync(async (req, res) => {
  const client = await Client.findById(req.params.id)
  if (!client) throw ApiError.notFound('Client not found')

  const { mediaId, label = '', category = 'file' } = req.body
  client.attachments.push({ media: mediaId, label, category })
  await client.save()
  await recordActivity(req, { action: 'attach', module: 'clients', targetId: client._id, description: `Attached a file to "${client.companyName}"` })
  return ok(res, client, 'File attached')
})

export const deleteClient = catchAsync(async (req, res) => {
  const client = await Client.findById(req.params.id)
  if (!client) throw ApiError.notFound('Client not found')

  const projectCount = await Project.countDocuments({ client: client._id })
  if (projectCount > 0) throw ApiError.conflict(`Cannot delete: client has ${projectCount} project(s). Archive instead.`)

  await client.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'clients', targetId: client._id, description: `Deleted client "${client.companyName}"` })
  return noContent(res, 'Client deleted')
})
