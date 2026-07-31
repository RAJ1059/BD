import { Router } from 'express'
import { body, param } from 'express-validator'
import * as blogController from '../controllers/blog.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorizeOwnerOrPermission, authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createBlogValidator, updateBlogValidator, blogIdValidator } from '../validators/blog.validators.js'
import { Blog } from '../models/Blog.js'

const router = Router()

router.use(authenticate)

async function ownerId(req) {
  const blog = await Blog.findById(req.params.id).select('author')
  return blog?.author
}

router.get('/', authorize('blogs', 'view'), blogController.listBlogs)
router.get('/analytics/summary', authorize('blogs', 'view'), blogController.blogAnalyticsSummary)
router.get('/:id', authorize('blogs', 'view'), blogIdValidator, validate, blogController.getBlog)
router.get('/:id/revisions', authorize('blogs', 'view'), blogIdValidator, validate, blogController.listRevisions)

router.post('/', authorize('blogs', 'create'), createBlogValidator, validate, blogController.createBlog)

router.patch(
  '/:id',
  blogIdValidator,
  validate,
  authorizeOwnerOrPermission('blogs', 'edit', ownerId),
  updateBlogValidator,
  validate,
  blogController.updateBlog
)

router.post('/:id/publish', authorize('blogs', 'publish'), blogIdValidator, validate, blogController.publishBlog)

router.patch(
  '/:id/comments/:commentId',
  authorize('blogs', 'approve'),
  param('id').isMongoId(),
  param('commentId').isMongoId(),
  body('approved').isBoolean(),
  validate,
  blogController.moderateComment
)

router.delete('/:id', authorize('blogs', 'delete'), blogIdValidator, validate, blogController.deleteBlog)

export default router
