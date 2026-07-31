import { Router } from 'express'
import * as roleController from '../controllers/role.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createRoleValidator, updateRoleValidator, roleIdValidator } from '../validators/role.validators.js'

const router = Router()

router.use(authenticate)

router.get('/permissions/catalog', roleController.permissionCatalog)
router.get('/', authorize('roles', 'view'), roleController.listRoles)
router.get('/:id', authorize('roles', 'view'), roleIdValidator, validate, roleController.getRole)
router.post('/', authorize('roles', 'create'), createRoleValidator, validate, roleController.createRole)
router.patch('/:id', authorize('roles', 'edit'), updateRoleValidator, validate, roleController.updateRole)
router.delete('/:id', authorize('roles', 'delete'), roleIdValidator, validate, roleController.deleteRole)

export default router
