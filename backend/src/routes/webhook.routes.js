import { Router } from 'express'
import * as webhookController from '../controllers/webhook.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createWebhookValidator, updateWebhookValidator, webhookIdValidator } from '../validators/webhook.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('webhooks', 'view'), webhookController.listWebhooks)
router.post('/', authorize('webhooks', 'create'), createWebhookValidator, validate, webhookController.createWebhook)
router.patch('/:id', authorize('webhooks', 'edit'), updateWebhookValidator, validate, webhookController.updateWebhook)
router.delete('/:id', authorize('webhooks', 'delete'), webhookIdValidator, validate, webhookController.deleteWebhook)
router.post('/:id/test', authorize('webhooks', 'edit'), webhookIdValidator, validate, webhookController.testWebhook)

export default router
