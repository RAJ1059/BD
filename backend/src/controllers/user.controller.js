import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { User } from '../models/User.js'
import { Role } from '../models/Role.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'
import { ROLE_NAMES } from '../config/constants.js'

async function assertCanAssignRole(actor, roleId) {
  const role = await Role.findById(roleId)
  if (!role) throw ApiError.badRequest('Role not found')
  if ((role.name === ROLE_NAMES.SUPER_ADMIN || role.name === ROLE_NAMES.ADMIN) && actor.role?.name !== ROLE_NAMES.SUPER_ADMIN) {
    throw ApiError.forbidden(`Only Super Admin can assign the ${role.name} role`)
  }
  return role
}

export const listUsers = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['name', 'email', 'createdAt', 'lastLoginAt'])

  const filter = {}
  if (req.query.role) filter.role = req.query.role
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i')
    filter.$or = [{ name: regex }, { email: regex }]
  }

  const [items, total] = await Promise.all([
    User.find(filter).populate('role', 'name').sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ])

  return ok(res, items, 'Users', buildMeta({ page, limit, total }))
})

export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).populate('role')
  if (!user) throw ApiError.notFound('User not found')
  return ok(res, user, 'User')
})

export const createUser = catchAsync(async (req, res) => {
  const { name, email, password, role, phone } = req.body

  await assertCanAssignRole(req.user, role)

  const exists = await User.exists({ email })
  if (exists) throw ApiError.conflict('A user with this email already exists')

  const user = await User.create({ name, email, phone, passwordHash: password, role, createdBy: req.user._id })
  await user.populate('role')

  await recordActivity(req, { action: 'create', module: 'users', targetId: user._id, description: `Created user "${user.name}"` })
  return created(res, user.toSafeObject(), 'User created')
})

export const updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw ApiError.notFound('User not found')

  const before = user.toSafeObject()
  const { name, email, role, phone, isActive } = req.body

  if (role !== undefined) {
    await assertCanAssignRole(req.user, role)
    user.role = role
  }
  if (name !== undefined) user.name = name
  if (email !== undefined) user.email = email
  if (phone !== undefined) user.phone = phone
  if (isActive !== undefined) {
    if (user._id.equals(req.user._id) && isActive === false) {
      throw ApiError.badRequest('You cannot deactivate your own account')
    }
    user.isActive = isActive
  }

  await user.save()
  await user.populate('role')

  await recordActivity(req, {
    action: 'update',
    module: 'users',
    targetId: user._id,
    description: `Updated user "${user.name}"`,
    changes: { before, after: user.toSafeObject() },
  })
  return ok(res, user.toSafeObject(), 'User updated')
})

export const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).populate('role')
  if (!user) throw ApiError.notFound('User not found')
  if (user._id.equals(req.user._id)) throw ApiError.badRequest('You cannot delete your own account')

  if (user.role?.name === ROLE_NAMES.SUPER_ADMIN) {
    const superAdminCount = await User.countDocuments({ role: user.role._id })
    if (superAdminCount <= 1) throw ApiError.badRequest('Cannot delete the last Super Admin')
  }

  await user.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'users', targetId: user._id, description: `Deleted user "${user.name}"` })
  return noContent(res, 'User deleted')
})
