import { Router } from 'express'
import * as tagController from '../controllers/tag.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createTagValidator, updateTagValidator, idValidator } from '../validators/taxonomy.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('tags', 'view'), tagController.listTags)
router.post('/', authorize('tags', 'create'), createTagValidator, validate, tagController.createTag)
router.patch('/:id', authorize('tags', 'edit'), updateTagValidator, validate, tagController.updateTag)
router.delete('/:id', authorize('tags', 'delete'), idValidator, validate, tagController.deleteTag)

export default router
