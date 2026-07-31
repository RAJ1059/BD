import { Router } from 'express'
import * as publicController from '../controllers/public.controller.js'
import { validate } from '../middlewares/validate.js'
import { publicFormLimiter } from '../middlewares/rateLimiter.js'
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

export default router
