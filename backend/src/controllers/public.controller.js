import path from 'node:path'
import crypto from 'node:crypto'
import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created } from '../utils/ApiResponse.js'
import { Blog } from '../models/Blog.js'
import { Page } from '../models/Page.js'
import { Menu } from '../models/Menu.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'
import { Lead } from '../models/Lead.js'
import { Form } from '../models/Form.js'
import { FormSubmission } from '../models/FormSubmission.js'
import { Media } from '../models/Media.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { env } from '../config/env.js'
import { sendEmail, emailTemplates } from '../services/email.service.js'
import { triggerWebhooks } from '../services/webhook.service.js'
import { sendSlackNotification, sendDiscordNotification } from '../services/notification.service.js'
import { storageService } from '../services/storage.service.js'
import { optimizeImage, isOptimizableImage } from '../services/image.service.js'
import { logger } from '../config/logger.js'
import { Redirect } from '../models/Redirect.js'
import { NotFoundLog } from '../models/NotFoundLog.js'
import { Setting } from '../models/Setting.js'
import { Campaign } from '../models/Campaign.js'
import { CampaignClick } from '../models/CampaignClick.js'
import { SocialLink } from '../models/SocialLink.js'
import { SocialClick } from '../models/SocialClick.js'
import { getActiveScriptsForPlacement } from '../services/scriptRenderer.service.js'
import { SCRIPT_PLACEMENTS } from '../config/constants.js'

const LEAD_NOTIFICATION_EMAIL = 'shivraj.singh@tekplus.com'

const PUBLIC_POPULATE = ['category', 'tags', { path: 'author', select: 'name avatar' }, 'featuredImage', 'gallery', 'seo.ogImage']

// Scheduled posts/pages flip to "published" the moment their scheduledAt
// time has passed, so the public site never needs its own cron job to see
// them. Exported so services/cronScheduler.service.js can also run this
// proactively on a schedule instead of relying purely on read-time checks.
export async function publishDuePosts() {
  await Blog.updateMany(
    { status: 'scheduled', scheduledAt: { $lte: new Date() } },
    [{ $set: { status: 'published', publishedAt: '$scheduledAt' } }]
  )
  await Page.updateMany(
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

export const getPublicPageBySlug = catchAsync(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, status: 'published' })
    .populate('featuredImage')
    .populate('seo.ogImage')
    .select('-revisions')

  if (!page) throw ApiError.notFound('Page not found')

  return ok(res, page, 'Page')
})

export const listPublicMenu = catchAsync(async (req, res) => {
  const menu = await Menu.findOne({ slug: req.params.slug, isActive: true }).populate({ path: 'items.page', select: 'slug' })
  if (!menu) throw ApiError.notFound('Menu not found')

  return ok(res, menu, 'Menu')
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

  const { subject, html } = emailTemplates.newLeadNotification({ name, email, phone, service, message })
  sendEmail({ to: LEAD_NOTIFICATION_EMAIL, subject, html }).catch((err) =>
    logger.error(`Failed to send lead notification email: ${err.message}`)
  )

  triggerWebhooks('lead.created', { leadId: lead._id, name, email, phone, service }).catch(() => {})
  sendSlackNotification(`New lead: ${name} (${email})`).catch(() => {})
  sendDiscordNotification(`New lead: ${name} (${email})`).catch(() => {})

  return created(res, { id: lead._id }, 'Thanks! Our team will reach out shortly.')
})

export const checkRedirect = catchAsync(async (req, res) => {
  const requestedPath = req.query.path
  if (!requestedPath) return ok(res, { redirect: null }, 'Redirect check')

  const redirect = await Redirect.findOneAndUpdate(
    { fromPath: requestedPath, isActive: true },
    { $inc: { hitCount: 1 } }
  )

  if (!redirect) return ok(res, { redirect: null }, 'Redirect check')
  return ok(res, { redirect: { toPath: redirect.toPath, statusCode: redirect.statusCode } }, 'Redirect check')
})

export const logNotFound = catchAsync(async (req, res) => {
  const { path: notFoundPath } = req.body
  if (!notFoundPath) throw ApiError.badRequest('path is required')

  await NotFoundLog.record(notFoundPath, {
    referrer: req.headers.referer || req.headers.referrer || '',
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  })

  return created(res, null, '404 recorded')
})

export const getPageScripts = catchAsync(async (req, res) => {
  const { path: pagePath = '/', placement } = req.query

  if (placement) {
    const scripts = await getActiveScriptsForPlacement(placement, pagePath)
    return ok(res, scripts, 'Page scripts')
  }

  const grouped = {}
  for (const p of SCRIPT_PLACEMENTS) {
    grouped[p] = await getActiveScriptsForPlacement(p, pagePath) // eslint-disable-line no-await-in-loop
  }

  return ok(res, grouped, 'Page scripts')
})

export const redirectShortLink = catchAsync(async (req, res) => {
  const campaign = await Campaign.findOne({ shortCode: req.params.code })
  if (!campaign) throw ApiError.notFound('Short link not found')

  campaign.clickCount += 1
  await campaign.save()

  await CampaignClick.create({
    campaign: campaign._id,
    referrer: req.headers.referer || req.headers.referrer || '',
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip,
  })

  return res.redirect(302, campaign.generatedUrl)
})

export const listPublicSocialLinks = catchAsync(async (_req, res) => {
  const links = await SocialLink.find({ isActive: true }).select('platform url')
  return ok(res, links, 'Social links')
})

export const redirectSocialClick = catchAsync(async (req, res) => {
  const link = await SocialLink.findOne({ platform: req.params.platform, isActive: true })
  if (!link) throw ApiError.notFound('Social link not found')

  link.clickCount += 1
  await link.save()

  await SocialClick.create({
    platform: link.platform,
    referrer: req.headers.referer || req.headers.referrer || '',
    userAgent: req.headers['user-agent'] || '',
  })

  return res.redirect(302, link.url)
})

export const robotsTxt = catchAsync(async (_req, res) => {
  const settings = await Setting.getSingleton()
  res.type('text/plain').send(settings.robotsTxt)
})

export const sitemapXml = catchAsync(async (_req, res) => {
  await publishDuePosts()
  const posts = await Blog.find({ status: 'published' }).select('slug updatedAt')
  const pages = await Page.find({ status: 'published' }).select('slug updatedAt')

  const staticPages = ['/', '/about', '/services', '/portfolio', '/blog', '/faq', '/contact', '/privacy-policy', '/terms']

  const urls = [
    ...staticPages.map((p) => `<url><loc>${env.clientUrl}${p}</loc></url>`),
    ...posts.map((p) => `<url><loc>${env.clientUrl}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`),
    ...pages.map((p) => `<url><loc>${env.clientUrl}/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`),
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

function mediaTypeFromMime(mimeType) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf' || mimeType.includes('word')) return 'document'
  return 'other'
}

export const listPublicFormFields = catchAsync(async (req, res) => {
  const form = await Form.findOne({ slug: req.params.slug, isActive: true }).select('name description fields allowFileUpload')
  if (!form) throw ApiError.notFound('Form not found')
  return ok(res, form, 'Form')
})

// Public form submission endpoint. Spam protection here is a simple
// honeypot field (`_honeypot`) — if it's filled in (a real visitor never
// sees or fills it), we silently pretend to succeed without saving
// anything or revealing that the bot was detected. Real captcha
// integration is a frontend concern and can be layered on top later.
export const submitPublicForm = catchAsync(async (req, res) => {
  const form = await Form.findOne({ slug: req.params.slug, isActive: true })
  if (!form) throw ApiError.notFound('Form not found')

  if (req.body._honeypot) {
    return created(res, { message: form.successMessage }, form.successMessage)
  }

  const data = { ...req.body }
  delete data._honeypot

  const files = []
  if (form.allowFileUpload && req.file) {
    const { originalname, mimetype, buffer, size } = req.file
    const folder = 'form-submissions'
    const ext = path.extname(originalname) || ''
    const baseName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
    const key = path.posix.join(folder, `${baseName}${ext}`)

    let width
    let height
    let thumbnailUrl = ''
    let thumbnailKey = ''
    let fileBuffer = buffer

    if (isOptimizableImage(mimetype)) {
      const optimized = await optimizeImage(buffer, { mimeType: mimetype })
      fileBuffer = optimized.buffer
      width = optimized.width
      height = optimized.height

      const thumbKey = path.posix.join(folder, `${baseName}-thumb.jpg`)
      const thumbSaved = await storageService.save(optimized.thumbnail, { key: thumbKey, mimeType: 'image/jpeg' })
      thumbnailUrl = thumbSaved.url
      thumbnailKey = thumbSaved.storageKey
    }

    const saved = await storageService.save(fileBuffer, { key, mimeType: mimetype })

    const media = await Media.create({
      fileName: path.basename(key),
      originalName: originalname,
      mimeType: mimetype,
      type: mediaTypeFromMime(mimetype),
      size,
      url: saved.url,
      thumbnailUrl,
      thumbnailKey,
      storageDriver: saved.storageDriver,
      storageKey: saved.storageKey,
      folder,
      width,
      height,
    })

    files.push({ fieldName: req.file.fieldname, media: media._id })
  }

  const submission = await FormSubmission.create({
    form: form._id,
    data,
    files,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
    referrer: req.headers.referer || req.headers.referrer || '',
  })

  triggerWebhooks('form.submitted', { formId: form._id, formName: form.name, data }).catch(() => {})

  if (form.notificationEmails.length) {
    const rows = Object.entries(data)
      .map(([key, value]) => `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`)
      .join('')
    const html = `<p>A new submission was received for "${form.name}".</p><table>${rows}</table>`
    sendEmail({ to: form.notificationEmails.join(','), subject: `New form submission: ${form.name}`, html }).catch((err) =>
      logger.error(`Failed to send form submission notification email: ${err.message}`)
    )
  }

  return created(res, { id: submission._id, message: form.successMessage }, form.successMessage)
})
