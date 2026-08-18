import { Router } from 'express'
import * as pageController from '../controllers/page.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createPageValidator, updatePageValidator, pageIdValidator } from '../validators/page.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('pages', 'view'), pageController.listPages)
router.get('/:id', authorize('pages', 'view'), pageIdValidator, validate, pageController.getPage)
router.get('/:id/revisions', authorize('pages', 'view'), pageIdValidator, validate, pageController.listRevisions)

router.post('/', authorize('pages', 'create'), createPageValidator, validate, pageController.createPage)

router.patch(
  '/:id',
  pageIdValidator,
  validate,
  authorize('pages', 'edit'),
  updatePageValidator,
  validate,
  pageController.updatePage
)

router.post('/:id/publish', authorize('pages', 'publish'), pageIdValidator, validate, pageController.publishPage)

router.delete('/:id', authorize('pages', 'delete'), pageIdValidator, validate, pageController.deletePage)

export default router
