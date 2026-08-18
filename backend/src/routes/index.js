import { Router } from 'express'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import roleRoutes from './role.routes.js'
import clientRoutes from './client.routes.js'
import leadRoutes from './lead.routes.js'
import projectRoutes from './project.routes.js'
import blogRoutes from './blog.routes.js'
import pageRoutes from './page.routes.js'
import menuRoutes from './menu.routes.js'
import categoryRoutes from './category.routes.js'
import tagRoutes from './tag.routes.js'
import mediaRoutes from './media.routes.js'
import mediaFolderRoutes from './mediaFolder.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import activityLogRoutes from './activityLog.routes.js'
import publicRoutes from './public.routes.js'
import clientPortalRoutes from './clientPortal.routes.js'
import settingsRoutes from './settings.routes.js'
import redirectRoutes from './redirect.routes.js'
import notFoundLogRoutes from './notFoundLog.routes.js'
import ipRuleRoutes from './ipRule.routes.js'
import apiKeyRoutes from './apiKey.routes.js'
import webhookRoutes from './webhook.routes.js'
import cronJobRoutes from './cronJob.routes.js'
import jobRoutes from './job.routes.js'
import backupRoutes from './backup.routes.js'
import logRoutes from './log.routes.js'
import scriptRoutes from './script.routes.js'
import campaignRoutes from './campaign.routes.js'
import socialRoutes from './social.routes.js'
import formRoutes from './form.routes.js'
import taskRoutes from './task.routes.js'
import integrationRoutes from './integration.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/roles', roleRoutes)
router.use('/clients', clientRoutes)
router.use('/leads', leadRoutes)
router.use('/projects', projectRoutes)
router.use('/blogs', blogRoutes)
router.use('/pages', pageRoutes)
router.use('/menus', menuRoutes)
router.use('/categories', categoryRoutes)
router.use('/tags', tagRoutes)
router.use('/media', mediaRoutes)
router.use('/media-folders', mediaFolderRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/activity-logs', activityLogRoutes)
router.use('/public', publicRoutes)
router.use('/client-portal', clientPortalRoutes)
router.use('/settings', settingsRoutes)
router.use('/redirects', redirectRoutes)
router.use('/not-found-logs', notFoundLogRoutes)
router.use('/ip-rules', ipRuleRoutes)
router.use('/api-keys', apiKeyRoutes)
router.use('/webhooks', webhookRoutes)
router.use('/cron-jobs', cronJobRoutes)
router.use('/jobs', jobRoutes)
router.use('/backups', backupRoutes)
router.use('/logs', logRoutes)
router.use('/scripts', scriptRoutes)
router.use('/campaigns', campaignRoutes)
router.use('/social-links', socialRoutes)
router.use('/forms', formRoutes)
router.use('/tasks', taskRoutes)
router.use('/integrations', integrationRoutes)

export default router
