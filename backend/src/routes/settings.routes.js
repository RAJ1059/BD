import { Router } from 'express'
import * as settingsController from '../controllers/settings.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { updateSettingsValidator } from '../validators/settings.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('settings', 'view'), settingsController.getSettings)
router.patch('/', authorize('settings', 'edit'), updateSettingsValidator, validate, settingsController.updateSettings)

export default router
