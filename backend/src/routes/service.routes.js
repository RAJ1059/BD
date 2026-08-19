import { Router } from 'express'
import * as serviceController from '../controllers/service.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import {
  createServiceValidator,
  updateServiceValidator,
  serviceIdValidator,
  reorderServicesValidator,
} from '../validators/service.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('services', 'view'), serviceController.listServices)
router.get('/:id', authorize('services', 'view'), serviceIdValidator, validate, serviceController.getService)

router.post('/', authorize('services', 'create'), createServiceValidator, validate, serviceController.createService)

router.patch('/reorder', authorize('services', 'edit'), reorderServicesValidator, validate, serviceController.reorderServices)

router.patch(
  '/:id',
  serviceIdValidator,
  validate,
  authorize('services', 'edit'),
  updateServiceValidator,
  validate,
  serviceController.updateService
)

router.delete('/:id', authorize('services', 'delete'), serviceIdValidator, validate, serviceController.deleteService)

export default router
