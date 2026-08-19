import { Router } from 'express'
import * as pageContentController from '../controllers/pageContent.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { pageKeyValidator, updatePageContentValidator } from '../validators/pageContent.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('pageContent', 'view'), pageContentController.listPageContents)
router.get('/:pageKey', authorize('pageContent', 'view'), pageKeyValidator, validate, pageContentController.getPageContent)
router.patch(
  '/:pageKey',
  authorize('pageContent', 'edit'),
  updatePageContentValidator,
  validate,
  pageContentController.updatePageContent
)

export default router
