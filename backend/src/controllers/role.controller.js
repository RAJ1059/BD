import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Role } from '../models/Role.js'
import { User } from '../models/User.js'
import { recordActivity } from '../services/activityLog.service.js'
import { PERMISSION_ACTIONS, PERMISSION_MODULES, ROLE_NAMES } from '../config/constants.js'

export const permissionCatalog = catchAsync(async (_req, res) => {
  return ok(res, { modules: PERMISSION_MODULES, actions: PERMISSION_ACTIONS }, 'Permission catalog')
})

export const listRoles = catchAsync(async (_req, res) => {
  const roles = await Role.find().sort('name')
  return ok(res, roles, 'Roles')
})

export const getRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) throw ApiError.notFound('Role not found')
  return ok(res, role, 'Role')
})

export const createRole = catchAsync(async (req, res) => {
  const { name, description = '', permissions = [] } = req.body
  const exists = await Role.exists({ name })
  if (exists) throw ApiError.conflict('A role with this name already exists')

  const role = await Role.create({ name, description, permissions })
  await recordActivity(req, { action: 'create', module: 'roles', targetId: role._id, description: `Created role "${role.name}"` })
  return created(res, role, 'Role created')
})

export const updateRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) throw ApiError.notFound('Role not found')
  if (role.isSystem && role.name === ROLE_NAMES.SUPER_ADMIN) {
    throw ApiError.forbidden('The Super Admin role cannot be modified')
  }

  const before = role.toObject()
  const { name, description, permissions } = req.body
  if (name !== undefined) role.name = name
  if (description !== undefined) role.description = description
  if (permissions !== undefined) role.permissions = permissions
  await role.save()

  await recordActivity(req, {
    action: 'update',
    module: 'roles',
    targetId: role._id,
    description: `Updated role "${role.name}"`,
    changes: { before, after: role.toObject() },
  })
  return ok(res, role, 'Role updated')
})

export const deleteRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id)
  if (!role) throw ApiError.notFound('Role not found')
  if (role.isSystem) throw ApiError.forbidden('System roles cannot be deleted')

  const assignedCount = await User.countDocuments({ role: role._id })
  if (assignedCount > 0) throw ApiError.conflict(`Cannot delete: ${assignedCount} user(s) still have this role`)

  await role.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'roles', targetId: role._id, description: `Deleted role "${role.name}"` })
  return noContent(res, 'Role deleted')
})
