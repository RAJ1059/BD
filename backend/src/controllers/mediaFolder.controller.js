import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { MediaFolder } from '../models/MediaFolder.js'
import { Media } from '../models/Media.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listMediaFolders = catchAsync(async (req, res) => {
  const filter = {}
  if (req.query.parent !== undefined) filter.parent = req.query.parent || null
  const folders = await MediaFolder.find(filter).sort('name')
  return ok(res, folders, 'Media folders')
})

export const createMediaFolder = catchAsync(async (req, res) => {
  const { name, parent = null } = req.body

  if (parent) {
    const parentFolder = await MediaFolder.findById(parent)
    if (!parentFolder) throw ApiError.badRequest('Parent folder not found')
  }

  const slug = await generateUniqueSlug(MediaFolder, name)
  const folder = await MediaFolder.create({ name, slug, parent, createdBy: req.user._id })
  await recordActivity(req, { action: 'create', module: 'media', targetId: folder._id, description: `Created media folder "${folder.name}"` })
  return created(res, folder, 'Media folder created')
})

export const renameMediaFolder = catchAsync(async (req, res) => {
  const folder = await MediaFolder.findById(req.params.id)
  if (!folder) throw ApiError.notFound('Media folder not found')

  const { name } = req.body
  if (name !== undefined && name !== folder.name) {
    folder.name = name
    folder.slug = await generateUniqueSlug(MediaFolder, name, { excludeId: folder._id })
  }

  await folder.save()
  await recordActivity(req, { action: 'update', module: 'media', targetId: folder._id, description: `Renamed media folder to "${folder.name}"` })
  return ok(res, folder, 'Media folder renamed')
})

export const deleteMediaFolder = catchAsync(async (req, res) => {
  const folder = await MediaFolder.findById(req.params.id)
  if (!folder) throw ApiError.notFound('Media folder not found')

  const inUse = await Media.countDocuments({ folder: { $in: [folder.slug, folder.name] } })
  if (inUse > 0) throw ApiError.conflict(`Cannot delete: ${inUse} file(s) are in this folder`)

  const hasChildren = await MediaFolder.countDocuments({ parent: folder._id })
  if (hasChildren > 0) throw ApiError.conflict(`Cannot delete: ${hasChildren} subfolder(s) reference this folder`)

  await folder.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'media', targetId: folder._id, description: `Deleted media folder "${folder.name}"` })
  return noContent(res, 'Media folder deleted')
})
