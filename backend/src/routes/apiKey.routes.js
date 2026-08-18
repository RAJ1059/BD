import { Router } from 'express'
import * as apiKeyController from '../controllers/apiKey.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createApiKeyValidator, apiKeyIdValidator } from '../validators/apiKey.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('apiKeys', 'view'), apiKeyController.listApiKeys)
router.post('/', authorize('apiKeys', 'create'), createApiKeyValidator, validate, apiKeyController.createApiKey)
router.patch('/:id/revoke', authorize('apiKeys', 'edit'), apiKeyIdValidator, validate, apiKeyController.revokeApiKey)
router.delete('/:id', authorize('apiKeys', 'delete'), apiKeyIdValidator, validate, apiKeyController.deleteApiKey)

export default router
