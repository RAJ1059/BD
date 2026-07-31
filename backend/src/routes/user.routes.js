import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createUserValidator, updateUserValidator, userIdValidator } from '../validators/user.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('users', 'view'), userController.listUsers)
router.get('/:id', authorize('users', 'view'), userIdValidator, validate, userController.getUser)
router.post('/', authorize('users', 'create'), createUserValidator, validate, userController.createUser)
router.patch('/:id', authorize('users', 'edit'), updateUserValidator, validate, userController.updateUser)
router.delete('/:id', authorize('users', 'delete'), userIdValidator, validate, userController.deleteUser)

export default router
