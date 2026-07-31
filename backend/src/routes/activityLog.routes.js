import { Router } from 'express'
import * as activityLogController from '../controllers/activityLog.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'

const router = Router()

router.use(authenticate)
router.get('/', authorize('activityLogs', 'view'), activityLogController.listActivityLogs)
router.get('/recent', authorize('activityLogs', 'view'), activityLogController.recentActivity)

export default router
