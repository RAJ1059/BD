import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Tag } from '../models/Tag.js'
import { Blog } from '../models/Blog.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listTags = catchAsync(async (_req, res) => {
  const tags = await Tag.find().sort('name')
  return ok(res, tags, 'Tags')
})

export const createTag = catchAsync(async (req, res) => {
  const { name } = req.body
  const slug = await generateUniqueSlug(Tag, name)
  const tag = await Tag.create({ name, slug })
  await recordActivity(req, { action: 'create', module: 'tags', targetId: tag._id, description: `Created tag "${tag.name}"` })
  return created(res, tag, 'Tag created')
})

export const updateTag = catchAsync(async (req, res) => {
  const tag = await Tag.findById(req.params.id)
  if (!tag) throw ApiError.notFound('Tag not found')

  const { name } = req.body
  if (name !== tag.name) {
    tag.name = name
    tag.slug = await generateUniqueSlug(Tag, name, { excludeId: tag._id })
  }
  await tag.save()
  await recordActivity(req, { action: 'update', module: 'tags', targetId: tag._id, description: `Updated tag "${tag.name}"` })
  return ok(res, tag, 'Tag updated')
})

export const deleteTag = catchAsync(async (req, res) => {
  const tag = await Tag.findById(req.params.id)
  if (!tag) throw ApiError.notFound('Tag not found')

  await Blog.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } })
  await tag.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'tags', targetId: tag._id, description: `Deleted tag "${tag.name}"` })
  return noContent(res, 'Tag deleted')
})
