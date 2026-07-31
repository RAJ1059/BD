import { Router } from 'express'
import * as categoryController from '../controllers/category.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createCategoryValidator, updateCategoryValidator, idValidator } from '../validators/taxonomy.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('categories', 'view'), categoryController.listCategories)
router.post('/', authorize('categories', 'create'), createCategoryValidator, validate, categoryController.createCategory)
router.patch('/:id', authorize('categories', 'edit'), updateCategoryValidator, validate, categoryController.updateCategory)
router.delete('/:id', authorize('categories', 'delete'), idValidator, validate, categoryController.deleteCategory)

export default router
