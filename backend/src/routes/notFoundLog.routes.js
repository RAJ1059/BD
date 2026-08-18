import { Router } from 'express'
import * as notFoundLogController from '../controllers/notFoundLog.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { notFoundLogIdValidator } from '../validators/notFoundLog.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('seo', 'view'), notFoundLogController.listNotFoundLogs)
router.delete('/:id', authorize('seo', 'delete'), notFoundLogIdValidator, validate, notFoundLogController.deleteNotFoundLog)

export default router
