import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created } from '../utils/ApiResponse.js'
import { Blog } from '../models/Blog.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'
import { Lead } from '../models/Lead.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { env } from '../config/env.js'

const PUBLIC_POPULATE = ['category', 'tags', { path: 'author', select: 'name avatar' }, 'featuredImage', 'gallery', 'seo.ogImage']

// Scheduled posts flip to "published" the moment their scheduledAt time has
// passed, so the public site never needs its own cron job to see them.
async function publishDuePosts() {
  await Blog.updateMany(
    { status: 'scheduled', scheduledAt: { $lte: new Date() } },
    [{ $set: { status: 'published', publishedAt: '$scheduledAt' } }]
  )
}

export const listPublicBlogs = catchAsync(async (req, res) => {
  await publishDuePosts()
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 9 })

  const filter = { status: 'published' }
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category })
    filter.category = category?._id || null
  }
  if (req.query.tag) {
    const tag = await Tag.findOne({ slug: req.query.tag })
    filter.tags = tag?._id || null
  }
  if (req.query.search) filter.$text = { $search: req.query.search }
  if (req.query.featured === 'true') filter.isFeatured = true

  const [items, total] = await Promise.all([
    Blog.find(filter).populate(PUBLIC_POPULATE).sort('-publishedAt').skip(skip).limit(limit).select('-content -revisions -comments'),
    Blog.countDocuments(filter),
  ])

  return ok(res, items, 'Blog posts', buildMeta({ page, limit, total }))
})

export const getPublicBlogBySlug = catchAsync(async (req, res) => {
  await publishDuePosts()

  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate(PUBLIC_POPULATE)
    .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt')

  if (!blog) throw ApiError.notFound('Blog post not found')

  let related = blog.relatedPosts
  if (!related.length && blog.category) {
    related = await Blog.find({ category: blog.category, status: 'published', _id: { $ne: blog._id } })
      .sort('-publishedAt')
      .limit(3)
      .select('title slug excerpt featuredImage publishedAt')
      .populate('featuredImage')
  }

  const approvedComments = blog.comments.filter((c) => c.approved)

  return ok(res, { ...blog.toObject(), comments: approvedComments, relatedPosts: related }, 'Blog post')
})

export const addPublicComment = catchAsync(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
  if (!blog) throw ApiError.notFound('Blog post not found')

  const { name, email, message } = req.body
  blog.comments.push({ name, email, message, approved: false })
  await blog.save()

  return created(res, null, 'Comment submitted and awaiting moderation')
})

export const listPublicCategories = catchAsync(async (_req, res) => {
  const categories = await Category.find().sort('name').select('name slug description')
  return ok(res, categories, 'Categories')
})

export const listPublicTags = catchAsync(async (_req, res) => {
  const tags = await Tag.find().sort('name').select('name slug')
  return ok(res, tags, 'Tags')
})

export const submitContactLead = catchAsync(async (req, res) => {
  const { companyName, name, email, phone, whatsapp, website, message, service } = req.body

  const lead = await Lead.create({
    companyName: companyName || name,
    contactPerson: name,
    email,
    phone,
    whatsapp,
    website,
    source: 'website',
    notes: message ? [{ text: `${service ? `[${service}] ` : ''}${message}` }] : [],
  })

  return created(res, { id: lead._id }, 'Thanks! Our team will reach out shortly.')
})

export const sitemapXml = catchAsync(async (_req, res) => {
  await publishDuePosts()
  const posts = await Blog.find({ status: 'published' }).select('slug updatedAt')

  const staticPages = ['/', '/about', '/services', '/portfolio', '/blog', '/faq', '/contact', '/privacy-policy', '/terms']

  const urls = [
    ...staticPages.map((p) => `<url><loc>${env.clientUrl}${p}</loc></url>`),
    ...posts.map((p) => `<url><loc>${env.clientUrl}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  res.header('Content-Type', 'application/xml')
  res.send(xml)
})

export const rssXml = catchAsync(async (_req, res) => {
  await publishDuePosts()
  const posts = await Blog.find({ status: 'published' }).sort('-publishedAt').limit(20).select('title slug excerpt publishedAt')

  const items = posts
    .map(
      (p) => `<item>
      <title><![CDATA[${p.title}]]></title>
      <link>${env.clientUrl}/blog/${p.slug}</link>
      <guid>${env.clientUrl}/blog/${p.slug}</guid>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n<title>${env.appName} Blog</title>\n<link>${env.clientUrl}/blog</link>\n<description>Insights on SEO, paid media, and digital strategy</description>\n${items}\n</channel></rss>`
  res.header('Content-Type', 'application/xml')
  res.send(xml)
})
