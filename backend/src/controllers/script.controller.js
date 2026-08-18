import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Script } from '../models/Script.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

export const listScripts = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)

  const filter = {}
  if (req.query.provider) filter.provider = req.query.provider
  if (req.query.placement) filter.placement = req.query.placement
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  const [items, total] = await Promise.all([
    Script.find(filter).sort('-createdAt').skip(skip).limit(limit).select('-versions'),
    Script.countDocuments(filter),
  ])

  return ok(res, items, 'Scripts', buildMeta({ page, limit, total }))
})

export const getScript = catchAsync(async (req, res) => {
  const script = await Script.findById(req.params.id)
  if (!script) throw ApiError.notFound('Script not found')
  return ok(res, script, 'Script')
})

export const createScript = catchAsync(async (req, res) => {
  const { code } = req.body

  const script = await Script.create({
    ...req.body,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    versions: [{ code, editedBy: req.user._id }],
  })

  await recordActivity(req, { action: 'create', module: 'scripts', targetId: script._id, description: `Created script "${script.name}"` })
  return created(res, script, 'Script created')
})

export const updateScript = catchAsync(async (req, res) => {
  const script = await Script.findById(req.params.id)
  if (!script) throw ApiError.notFound('Script not found')

  const before = script.toObject()
  const { code } = req.body

  if (code !== undefined && code !== script.code) {
    script.versions.push({ code: script.code, editedBy: req.user._id })
    if (script.versions.length > 20) script.versions = script.versions.slice(-20)
    script.code = code
  }

  const assignable = ['name', 'provider', 'placement', 'isActive', 'targetPages', 'scheduleStart', 'scheduleEnd']
  for (const field of assignable) {
    if (req.body[field] !== undefined) script[field] = req.body[field]
  }

  script.updatedBy = req.user._id
  await script.save()

  await recordActivity(req, {
    action: 'update',
    module: 'scripts',
    targetId: script._id,
    description: `Updated script "${script.name}"`,
    changes: { before: { name: before.name, isActive: before.isActive }, after: { name: script.name, isActive: script.isActive } },
  })
  return ok(res, script, 'Script updated')
})

export const toggleScript = catchAsync(async (req, res) => {
  const script = await Script.findById(req.params.id)
  if (!script) throw ApiError.notFound('Script not found')

  script.isActive = !script.isActive
  script.updatedBy = req.user._id
  await script.save()

  await recordActivity(req, {
    action: 'update',
    module: 'scripts',
    targetId: script._id,
    description: `${script.isActive ? 'Activated' : 'Deactivated'} script "${script.name}"`,
  })
  return ok(res, script, 'Script toggled')
})

export const deleteScript = catchAsync(async (req, res) => {
  const script = await Script.findById(req.params.id)
  if (!script) throw ApiError.notFound('Script not found')

  await script.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'scripts', targetId: script._id, description: `Deleted script "${script.name}"` })
  return noContent(res, 'Script deleted')
})

export const listScriptVersions = catchAsync(async (req, res) => {
  const script = await Script.findById(req.params.id).select('versions name').populate('versions.editedBy', 'name avatar')
  if (!script) throw ApiError.notFound('Script not found')
  return ok(res, script.versions, 'Version history')
})
