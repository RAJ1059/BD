import { Router } from 'express'
import * as backupController from '../controllers/backup.controller.js'
import { authenticate, requireSuperAdmin } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { backupFileNameValidator } from '../validators/backup.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('settings', 'view'), backupController.listBackupFiles)
router.post('/', authorize('settings', 'edit'), backupController.createBackupNow)
router.get('/:fileName/download', authorize('settings', 'view'), backupFileNameValidator, validate, backupController.downloadBackup)
// Restoring is maximally destructive — require Super Admin in addition to the settings permission.
router.post('/:fileName/restore', authorize('settings', 'edit'), requireSuperAdmin, backupFileNameValidator, validate, backupController.restoreFromBackup)

export default router
