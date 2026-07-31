import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Project } from '../models/Project.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listProjects = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.client) filter.client = req.query.client

  const [items, total] = await Promise.all([
    Project.find(filter).populate('client', 'companyName').populate('assignedTeam', 'name avatar').sort('-createdAt').skip(skip).limit(limit),
    Project.countDocuments(filter),
  ])

  return ok(res, items, 'Projects', buildMeta({ page, limit, total }))
})

export const getProject = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('client', 'companyName').populate('assignedTeam', 'name avatar')
  if (!project) throw ApiError.notFound('Project not found')
  return ok(res, project, 'Project')
})

export const createProject = catchAsync(async (req, res) => {
  const project = await Project.create({ ...req.body, createdBy: req.user._id })
  await recordActivity(req, { action: 'create', module: 'projects', targetId: project._id, description: `Created project "${project.name}"` })
  return created(res, project, 'Project created')
})

export const updateProject = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) throw ApiError.notFound('Project not found')

  const before = project.toObject()
  Object.assign(project, req.body)
  await project.save()

  await recordActivity(req, {
    action: 'update',
    module: 'projects',
    targetId: project._id,
    description: `Updated project "${project.name}"`,
    changes: { before, after: project.toObject() },
  })
  return ok(res, project, 'Project updated')
})

export const deleteProject = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) throw ApiError.notFound('Project not found')

  await project.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'projects', targetId: project._id, description: `Deleted project "${project.name}"` })
  return noContent(res, 'Project deleted')
})
