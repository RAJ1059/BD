import { Router } from 'express'
import * as integrationController from '../controllers/integration.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { providerParamValidator, connectIntegrationValidator } from '../validators/integration.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('integrations', 'view'), integrationController.listIntegrations)
router.get('/:provider', authorize('integrations', 'view'), providerParamValidator, validate, integrationController.getIntegrationStatus)

router.put('/:provider', authorize('integrations', 'edit'), connectIntegrationValidator, validate, integrationController.connectIntegration)
router.put('/:provider/disconnect', authorize('integrations', 'edit'), providerParamValidator, validate, integrationController.disconnectIntegration)

router.post('/:provider/test', authorize('integrations', 'view'), providerParamValidator, validate, integrationController.testIntegrationConnection)

export default router
