import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Blog } from '../models/Blog.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { estimateReadingTime } from '../utils/readingTime.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'

const POPULATE = ['category', 'tags', { path: 'author', select: 'name avatar' }, 'featuredImage', 'gallery', 'seo.ogImage']

export const listBlogs = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['title', 'createdAt', 'publishedAt', 'viewCount'])

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.category) filter.category = req.query.category
  if (req.query.tag) filter.tags = req.query.tag
  if (req.query.author) filter.author = req.query.author
  if (req.query.search) filter.$text = { $search: req.query.search }

  const [items, total] = await Promise.all([
    Blog.find(filter).populate(POPULATE).sort(sort).skip(skip).limit(limit).select('-content -revisions -comments'),
    Blog.countDocuments(filter),
  ])

  return ok(res, items, 'Blog posts', buildMeta({ page, limit, total }))
})

export const getBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate(POPULATE).populate('relatedPosts', 'title slug featuredImage')
  if (!blog) throw ApiError.notFound('Blog post not found')
  return ok(res, blog, 'Blog post')
})

export const createBlog = catchAsync(async (req, res) => {
  const { title, content, status = 'draft', scheduledAt } = req.body
  const slug = await generateUniqueSlug(Blog, title)

  const blog = await Blog.create({
    ...req.body,
    slug,
    status,
    scheduledAt: status === 'scheduled' ? scheduledAt : null,
    publishedAt: status === 'published' ? new Date() : null,
    readingTimeMinutes: estimateReadingTime(content),
    author: req.body.author || req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    revisions: [{ title, content, editedBy: req.user._id }],
  })

  await recordActivity(req, { action: 'create', module: 'blogs', targetId: blog._id, description: `Created blog post "${blog.title}"` })
  return created(res, blog, 'Blog post created')
})

export const updateBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) throw ApiError.notFound('Blog post not found')

  const before = blog.toObject()
  const { title, content, status, scheduledAt } = req.body

  const contentChanged = (title !== undefined && title !== blog.title) || (content !== undefined && content !== blog.content)
  if (contentChanged) {
    blog.revisions.push({ title: blog.title, content: blog.content, editedBy: req.user._id })
    if (blog.revisions.length > 20) blog.revisions = blog.revisions.slice(-20)
  }

  if (title !== undefined && title !== blog.title) {
    blog.title = title
    blog.slug = await generateUniqueSlug(Blog, title, { excludeId: blog._id })
  }
  if (content !== undefined) {
    blog.content = content
    blog.readingTimeMinutes = estimateReadingTime(content)
  }

  const assignable = ['excerpt', 'category', 'tags', 'featuredImage', 'gallery', 'isFeatured', 'seo', 'relatedPosts']
  for (const field of assignable) {
    if (req.body[field] !== undefined) blog[field] = req.body[field]
  }

  if (status !== undefined) {
    blog.status = status
    if (status === 'scheduled') blog.scheduledAt = scheduledAt
    if (status === 'published' && !blog.publishedAt) blog.publishedAt = new Date()
  }

  blog.updatedBy = req.user._id
  await blog.save()

  await recordActivity(req, {
    action: 'update',
    module: 'blogs',
    targetId: blog._id,
    description: `Updated blog post "${blog.title}"`,
    changes: { before: { title: before.title, status: before.status }, after: { title: blog.title, status: blog.status } },
  })
  return ok(res, blog, 'Blog post updated')
})

export const publishBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) throw ApiError.notFound('Blog post not found')

  blog.status = 'published'
  blog.publishedAt = blog.publishedAt || new Date()
  blog.scheduledAt = null
  blog.updatedBy = req.user._id
  await blog.save()

  await recordActivity(req, { action: 'publish', module: 'blogs', targetId: blog._id, description: `Published blog post "${blog.title}"` })
  return ok(res, blog, 'Blog post published')
})

export const deleteBlog = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) throw ApiError.notFound('Blog post not found')

  await blog.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'blogs', targetId: blog._id, description: `Deleted blog post "${blog.title}"` })
  return noContent(res, 'Blog post deleted')
})

export const listRevisions = catchAsync(async (req, res) => {
  const blog = await Blog.findById(req.params.id).select('revisions title').populate('revisions.editedBy', 'name avatar')
  if (!blog) throw ApiError.notFound('Blog post not found')
  return ok(res, blog.revisions, 'Revision history')
})

export const moderateComment = catchAsync(async (req, res) => {
  const { id, commentId } = req.params
  const { approved } = req.body

  const blog = await Blog.findById(id)
  if (!blog) throw ApiError.notFound('Blog post not found')

  const comment = blog.comments.id(commentId)
  if (!comment) throw ApiError.notFound('Comment not found')

  comment.approved = Boolean(approved)
  await blog.save()

  await recordActivity(req, { action: 'moderate_comment', module: 'blogs', targetId: blog._id, description: `${approved ? 'Approved' : 'Rejected'} a comment on "${blog.title}"` })
  return ok(res, comment, 'Comment moderated')
})

export const blogAnalyticsSummary = catchAsync(async (_req, res) => {
  const [totals] = await Blog.aggregate([
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
        totalViews: { $sum: '$viewCount' },
      },
    },
  ])

  const topPosts = await Blog.find({ status: 'published' }).sort('-viewCount').limit(5).select('title slug viewCount')

  return ok(res, { totals: totals || { totalPosts: 0, published: 0, drafts: 0, scheduled: 0, totalViews: 0 }, topPosts }, 'Blog analytics')
})
