import { Router } from 'express'
import * as dashboardController from '../controllers/dashboard.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'

const router = Router()

router.use(authenticate)

router.get('/summary', authorize('dashboard', 'view'), dashboardController.getSummary)
router.get('/charts', authorize('dashboard', 'view'), dashboardController.getCharts)
router.get('/team-overview', authorize('dashboard', 'view'), dashboardController.teamOverview)

export default router
