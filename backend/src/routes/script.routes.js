import { Router } from 'express'
import * as scriptController from '../controllers/script.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createScriptValidator, updateScriptValidator, scriptIdValidator } from '../validators/script.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('scripts', 'view'), scriptController.listScripts)
router.get('/:id', authorize('scripts', 'view'), scriptIdValidator, validate, scriptController.getScript)
router.get('/:id/versions', authorize('scripts', 'view'), scriptIdValidator, validate, scriptController.listScriptVersions)

router.post('/', authorize('scripts', 'create'), createScriptValidator, validate, scriptController.createScript)

router.patch('/:id', authorize('scripts', 'edit'), updateScriptValidator, validate, scriptController.updateScript)
router.patch('/:id/toggle', authorize('scripts', 'edit'), scriptIdValidator, validate, scriptController.toggleScript)

router.delete('/:id', authorize('scripts', 'delete'), scriptIdValidator, validate, scriptController.deleteScript)

export default router
