import { Router } from 'express'
import * as jobController from '../controllers/job.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { jobIdValidator } from '../validators/job.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('settings', 'view'), jobController.listJobs)
router.post('/:id/retry', authorize('settings', 'edit'), jobIdValidator, validate, jobController.retryJob)

export default router
