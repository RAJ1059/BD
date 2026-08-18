import { Router } from 'express'
import * as mediaFolderController from '../controllers/mediaFolder.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createMediaFolderValidator, renameMediaFolderValidator, mediaFolderIdValidator } from '../validators/mediaFolder.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('media', 'view'), mediaFolderController.listMediaFolders)
router.post('/', authorize('media', 'create'), createMediaFolderValidator, validate, mediaFolderController.createMediaFolder)
router.patch('/:id', authorize('media', 'edit'), renameMediaFolderValidator, validate, mediaFolderController.renameMediaFolder)
router.delete('/:id', authorize('media', 'delete'), mediaFolderIdValidator, validate, mediaFolderController.deleteMediaFolder)

export default router
