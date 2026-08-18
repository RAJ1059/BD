import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Page } from '../models/Page.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'

const POPULATE = ['featuredImage', 'seo.ogImage']

export const listPages = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['title', 'createdAt', 'publishedAt'])

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.template) filter.template = req.query.template
  if (req.query.search) filter.$text = { $search: req.query.search }

  const [items, total] = await Promise.all([
    Page.find(filter).populate(POPULATE).sort(sort).skip(skip).limit(limit).select('-content -revisions'),
    Page.countDocuments(filter),
  ])

  return ok(res, items, 'Pages', buildMeta({ page, limit, total }))
})

export const getPage = catchAsync(async (req, res) => {
  const page = await Page.findById(req.params.id).populate(POPULATE)
  if (!page) throw ApiError.notFound('Page not found')
  return ok(res, page, 'Page')
})

export const createPage = catchAsync(async (req, res) => {
  const { title, content, status = 'draft', scheduledAt } = req.body
  const slug = await generateUniqueSlug(Page, title)

  const page = await Page.create({
    ...req.body,
    slug,
    status,
    scheduledAt: status === 'scheduled' ? scheduledAt : null,
    publishedAt: status === 'published' ? new Date() : null,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    revisions: [{ title, content, editedBy: req.user._id }],
  })

  await recordActivity(req, { action: 'create', module: 'pages', targetId: page._id, description: `Created page "${page.title}"` })
  return created(res, page, 'Page created')
})

export const updatePage = catchAsync(async (req, res) => {
  const page = await Page.findById(req.params.id)
  if (!page) throw ApiError.notFound('Page not found')

  const before = page.toObject()
  const { title, content, status, scheduledAt } = req.body

  const contentChanged = (title !== undefined && title !== page.title) || (content !== undefined && content !== page.content)
  if (contentChanged) {
    page.revisions.push({ title: page.title, content: page.content, editedBy: req.user._id })
    if (page.revisions.length > 20) page.revisions = page.revisions.slice(-20)
  }

  if (title !== undefined && title !== page.title) {
    page.title = title
    page.slug = await generateUniqueSlug(Page, title, { excludeId: page._id })
  }
  if (content !== undefined) {
    page.content = content
  }

  const assignable = ['template', 'featuredImage', 'seo']
  for (const field of assignable) {
    if (req.body[field] !== undefined) page[field] = req.body[field]
  }

  if (status !== undefined) {
    page.status = status
    if (status === 'scheduled') page.scheduledAt = scheduledAt
    if (status === 'published' && !page.publishedAt) page.publishedAt = new Date()
  }

  page.updatedBy = req.user._id
  await page.save()

  await recordActivity(req, {
    action: 'update',
    module: 'pages',
    targetId: page._id,
    description: `Updated page "${page.title}"`,
    changes: { before: { title: before.title, status: before.status }, after: { title: page.title, status: page.status } },
  })
  return ok(res, page, 'Page updated')
})

export const publishPage = catchAsync(async (req, res) => {
  const page = await Page.findById(req.params.id)
  if (!page) throw ApiError.notFound('Page not found')

  page.status = 'published'
  page.publishedAt = page.publishedAt || new Date()
  page.scheduledAt = null
  page.updatedBy = req.user._id
  await page.save()

  await recordActivity(req, { action: 'publish', module: 'pages', targetId: page._id, description: `Published page "${page.title}"` })
  return ok(res, page, 'Page published')
})

export const deletePage = catchAsync(async (req, res) => {
  const page = await Page.findById(req.params.id)
  if (!page) throw ApiError.notFound('Page not found')

  await page.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'pages', targetId: page._id, description: `Deleted page "${page.title}"` })
  return noContent(res, 'Page deleted')
})

export const listRevisions = catchAsync(async (req, res) => {
  const page = await Page.findById(req.params.id).select('revisions title').populate('revisions.editedBy', 'name avatar')
  if (!page) throw ApiError.notFound('Page not found')
  return ok(res, page.revisions, 'Revision history')
})
