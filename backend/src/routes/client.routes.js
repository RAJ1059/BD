import { Router } from 'express'
import { body } from 'express-validator'
import * as clientController from '../controllers/client.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createClientValidator, updateClientValidator, clientIdValidator } from '../validators/client.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('clients', 'view'), clientController.listClients)
router.get('/:id', authorize('clients', 'view'), clientIdValidator, validate, clientController.getClient)
router.post('/', authorize('clients', 'create'), createClientValidator, validate, clientController.createClient)
router.patch('/:id', authorize('clients', 'edit'), updateClientValidator, validate, clientController.updateClient)
router.post(
  '/:id/attachments',
  authorize('clients', 'edit'),
  clientIdValidator,
  body('mediaId').isMongoId(),
  validate,
  clientController.attachClientFile
)
router.delete('/:id', authorize('clients', 'delete'), clientIdValidator, validate, clientController.deleteClient)

export default router
