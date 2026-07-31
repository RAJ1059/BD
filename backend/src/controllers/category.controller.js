import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Category } from '../models/Category.js'
import { Blog } from '../models/Blog.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listCategories = catchAsync(async (_req, res) => {
  const categories = await Category.find().populate('parent', 'name slug').sort('name')
  return ok(res, categories, 'Categories')
})

export const createCategory = catchAsync(async (req, res) => {
  const { name, description = '', parent = null } = req.body
  const slug = await generateUniqueSlug(Category, name)
  const category = await Category.create({ name, slug, description, parent })
  await recordActivity(req, { action: 'create', module: 'categories', targetId: category._id, description: `Created category "${category.name}"` })
  return created(res, category, 'Category created')
})

export const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw ApiError.notFound('Category not found')

  const { name, description, parent } = req.body
  if (name !== undefined && name !== category.name) {
    category.name = name
    category.slug = await generateUniqueSlug(Category, name, { excludeId: category._id })
  }
  if (description !== undefined) category.description = description
  if (parent !== undefined) category.parent = parent

  await category.save()
  await recordActivity(req, { action: 'update', module: 'categories', targetId: category._id, description: `Updated category "${category.name}"` })
  return ok(res, category, 'Category updated')
})

export const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) throw ApiError.notFound('Category not found')

  const inUse = await Blog.countDocuments({ category: category._id })
  if (inUse > 0) throw ApiError.conflict(`Cannot delete: ${inUse} blog post(s) use this category`)

  await category.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'categories', targetId: category._id, description: `Deleted category "${category.name}"` })
  return noContent(res, 'Category deleted')
})
