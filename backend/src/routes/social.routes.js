import { Router } from 'express'
import * as socialController from '../controllers/social.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { platformParamValidator, upsertSocialLinkValidator } from '../validators/social.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('social', 'view'), socialController.listSocialLinks)
router.get('/analytics', authorize('social', 'view'), socialController.socialAnalytics)

router.put('/:platform', authorize('social', 'edit'), upsertSocialLinkValidator, validate, socialController.upsertSocialLink)

router.delete('/:platform', authorize('social', 'delete'), platformParamValidator, validate, socialController.deleteSocialLink)

export default router
