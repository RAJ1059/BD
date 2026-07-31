import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/ApiResponse.js'
import { Client } from '../models/Client.js'
import { Project } from '../models/Project.js'

function requireLinkedClient(req) {
  if (!req.user.client) throw ApiError.forbidden('Your account is not linked to a client record yet. Contact your account manager.')
  return req.user.client
}

export const getSummary = catchAsync(async (req, res) => {
  const clientId = requireLinkedClient(req)

  const [client, totalProjects, runningProjects, completedProjects, recentProjects] = await Promise.all([
    Client.findById(clientId).populate('accountManager', 'name email avatar'),
    Project.countDocuments({ client: clientId }),
    Project.countDocuments({ client: clientId, status: 'in_progress' }),
    Project.countDocuments({ client: clientId, status: 'completed' }),
    Project.find({ client: clientId }).populate('assignedTeam', 'name avatar').sort('-createdAt').limit(5),
  ])

  if (!client) throw ApiError.notFound('Linked client record not found')

  return ok(res, {
    client,
    projects: { total: totalProjects, running: runningProjects, completed: completedProjects },
    recentProjects,
  }, 'Client portal summary')
})

export const getProfile = catchAsync(async (req, res) => {
  const clientId = requireLinkedClient(req)
  const client = await Client.findById(clientId).populate('accountManager', 'name email avatar')
  if (!client) throw ApiError.notFound('Linked client record not found')
  return ok(res, client, 'Client profile')
})

export const listProjects = catchAsync(async (req, res) => {
  const clientId = requireLinkedClient(req)
  const filter = { client: clientId }
  if (req.query.status) filter.status = req.query.status

  const projects = await Project.find(filter).populate('assignedTeam', 'name avatar').sort('-createdAt')
  return ok(res, projects, 'Your projects')
})
