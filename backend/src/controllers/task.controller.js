import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Task } from '../models/Task.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'

export const listTasks = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['title', 'createdAt', 'dueDate', 'priority', 'status'])

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.priority) filter.priority = req.query.priority
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
  if (req.query.relatedLead) filter.relatedLead = req.query.relatedLead
  if (req.query.relatedClient) filter.relatedClient = req.query.relatedClient

  const [items, total] = await Promise.all([
    Task.find(filter).populate('assignedTo', 'name avatar').sort(sort).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ])

  return ok(res, items, 'Tasks', buildMeta({ page, limit, total }))
})

export const getTask = catchAsync(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name avatar')
    .populate('relatedLead', 'companyName')
    .populate('relatedClient', 'companyName')
    .populate('relatedProject', 'name')
  if (!task) throw ApiError.notFound('Task not found')
  return ok(res, task, 'Task')
})

export const createTask = catchAsync(async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id })
  await recordActivity(req, { action: 'create', module: 'tasks', targetId: task._id, description: `Created task "${task.title}"` })
  return created(res, task, 'Task created')
})

export const updateTask = catchAsync(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) throw ApiError.notFound('Task not found')

  const before = task.toObject()
  Object.assign(task, req.body)

  if (req.body.status !== undefined) {
    if (task.status === 'done' && !task.completedAt) task.completedAt = new Date()
    else if (task.status !== 'done') task.completedAt = null
  }

  await task.save()

  await recordActivity(req, {
    action: 'update',
    module: 'tasks',
    targetId: task._id,
    description: `Updated task "${task.title}"`,
    changes: { before, after: task.toObject() },
  })
  return ok(res, task, 'Task updated')
})

export const deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task) throw ApiError.notFound('Task not found')

  await task.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'tasks', targetId: task._id, description: `Deleted task "${task.title}"` })
  return noContent(res, 'Task deleted')
})
