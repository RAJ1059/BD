import { Router } from 'express'
import * as redirectController from '../controllers/redirect.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createRedirectValidator, updateRedirectValidator, redirectIdValidator } from '../validators/redirect.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('redirects', 'view'), redirectController.listRedirects)
router.get('/:id', authorize('redirects', 'view'), redirectIdValidator, validate, redirectController.getRedirect)
router.post('/', authorize('redirects', 'create'), createRedirectValidator, validate, redirectController.createRedirect)
router.patch('/:id', authorize('redirects', 'edit'), updateRedirectValidator, validate, redirectController.updateRedirect)
router.delete('/:id', authorize('redirects', 'delete'), redirectIdValidator, validate, redirectController.deleteRedirect)

export default router
