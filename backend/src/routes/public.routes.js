import { Router } from 'express'
import * as publicController from '../controllers/public.controller.js'
import { validate } from '../middlewares/validate.js'
import { publicFormLimiter } from '../middlewares/rateLimiter.js'
import { upload } from '../middlewares/upload.js'
import { contactLeadValidator, publicCommentValidator } from '../validators/public.validators.js'

const router = Router()

/**
 * @openapi
 * /public/blogs:
 *   get:
 *     tags: [Public]
 *     summary: List published blog posts (used by the website's blog listing page)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string, description: "category slug" }
 *       - in: query
 *         name: tag
 *         schema: { type: string, description: "tag slug" }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Paginated published posts }
 */
router.get('/blogs', publicController.listPublicBlogs)

/**
 * @openapi
 * /public/blogs/{slug}:
 *   get:
 *     tags: [Public]
 *     summary: Get a published blog post by slug (used by the website's blog detail page)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Blog post with approved comments and related posts }
 *       404: { description: Not found }
 */
router.get('/blogs/:slug', publicController.getPublicBlogBySlug)

/**
 * @openapi
 * /public/blogs/{slug}/comments:
 *   post:
 *     tags: [Public]
 *     summary: Submit a comment on a blog post (held for moderation)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               message: { type: string }
 *     responses:
 *       201: { description: Comment submitted, awaiting approval }
 */
router.post('/blogs/:slug/comments', publicFormLimiter, publicCommentValidator, validate, publicController.addPublicComment)

router.get('/pages/:slug', publicController.getPublicPageBySlug)
router.get('/page-content/:pageKey', publicController.getPublicPageContent)
router.get('/services', publicController.listPublicServices)
router.get('/services/:slug', publicController.getPublicServiceBySlug)
router.get('/menus/:slug', publicController.listPublicMenu)

router.get('/categories', publicController.listPublicCategories)
router.get('/tags', publicController.listPublicTags)

/**
 * @openapi
 * /public/contact:
 *   post:
 *     tags: [Public]
 *     summary: Submit the website contact form (creates a CRM lead automatically)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               service: { type: string }
 *               message: { type: string }
 *     responses:
 *       201: { description: Lead created from contact form }
 */
router.post('/contact', publicFormLimiter, contactLeadValidator, validate, publicController.submitContactLead)

router.get('/redirect-check', publicController.checkRedirect)
router.post('/log-404', publicFormLimiter, publicController.logNotFound)

/**
 * @openapi
 * /public/scripts:
 *   get:
 *     tags: [Public]
 *     summary: Get active tracking/marketing scripts for a given page and placement (used by the website to self-inject scripts)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: path
 *         schema: { type: string, description: "the requesting page path, e.g. /about" }
 *       - in: query
 *         name: placement
 *         schema: { type: string, enum: [head, body_start, body_end] }
 *     responses:
 *       200: { description: Array of scripts for the placement, or grouped by placement if omitted }
 */
router.get('/scripts', publicController.getPageScripts)

/**
 * @openapi
 * /public/utm/{code}:
 *   get:
 *     tags: [Public]
 *     summary: Resolve a UTM campaign short link, log the click, and redirect to the destination URL
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redirect to the campaign's generated UTM URL }
 *       404: { description: Short link not found }
 */
router.get('/utm/:code', publicController.redirectShortLink)

router.get('/social-links', publicController.listPublicSocialLinks)

/**
 * @openapi
 * /public/social/{platform}:
 *   get:
 *     tags: [Public]
 *     summary: Log a social link click and redirect to the platform's URL
 *     security: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redirect to the social platform's URL }
 *       404: { description: Social link not found or inactive }
 */
router.get('/social/:platform', publicController.redirectSocialClick)

/**
 * @openapi
 * /public/forms/{slug}:
 *   get:
 *     tags: [Public]
 *     summary: Get a form's field definitions so the website can render it dynamically
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Form name/description/fields }
 *       404: { description: Not found }
 */
router.get('/forms/:slug', publicController.listPublicFormFields)

/**
 * @openapi
 * /public/forms/{slug}/submit:
 *   post:
 *     tags: [Public]
 *     summary: Submit a dynamic form (optionally with one file upload)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Submission recorded }
 *       404: { description: Not found }
 */
router.post('/forms/:slug/submit', publicFormLimiter, upload.single('file'), publicController.submitPublicForm)

export default router
