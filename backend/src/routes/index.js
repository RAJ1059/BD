import { Router } from 'express'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import roleRoutes from './role.routes.js'
import clientRoutes from './client.routes.js'
import leadRoutes from './lead.routes.js'
import projectRoutes from './project.routes.js'
import blogRoutes from './blog.routes.js'
import categoryRoutes from './category.routes.js'
import tagRoutes from './tag.routes.js'
import mediaRoutes from './media.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import activityLogRoutes from './activityLog.routes.js'
import publicRoutes from './public.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/roles', roleRoutes)
router.use('/clients', clientRoutes)
router.use('/leads', leadRoutes)
router.use('/projects', projectRoutes)
router.use('/blogs', blogRoutes)
router.use('/categories', categoryRoutes)
router.use('/tags', tagRoutes)
router.use('/media', mediaRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/activity-logs', activityLogRoutes)
router.use('/public', publicRoutes)

export default router
