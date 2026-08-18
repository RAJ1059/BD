import { Router } from 'express'
import * as logController from '../controllers/log.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'

const router = Router()

router.use(authenticate)

router.get('/errors', authorize('settings', 'view'), logController.getErrorLogs)

export default router
