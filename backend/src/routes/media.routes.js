import { Router } from 'express'
import { param } from 'express-validator'
import * as mediaController from '../controllers/media.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { upload } from '../middlewares/upload.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('media', 'view'), mediaController.listMedia)
router.get('/:id', authorize('media', 'view'), param('id').isMongoId(), validate, mediaController.getMedia)
router.post('/', authorize('media', 'create'), upload.single('file'), mediaController.uploadMedia)
router.delete('/:id', authorize('media', 'delete'), param('id').isMongoId(), validate, mediaController.deleteMedia)

export default router
