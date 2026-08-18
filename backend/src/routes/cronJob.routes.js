import { Router } from 'express'
import * as cronJobController from '../controllers/cronJob.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { updateCronJobValidator, cronJobIdValidator } from '../validators/cronJob.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('settings', 'view'), cronJobController.listCronJobs)
router.patch('/:id', authorize('settings', 'edit'), updateCronJobValidator, validate, cronJobController.updateCronJob)
router.post('/:id/run', authorize('settings', 'edit'), cronJobIdValidator, validate, cronJobController.runCronJobNow)

export default router
