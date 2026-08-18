import { Router } from 'express'
import * as formController from '../controllers/form.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createFormValidator, updateFormValidator, formIdValidator } from '../validators/form.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('forms', 'view'), formController.listForms)
router.get('/:id', authorize('forms', 'view'), formIdValidator, validate, formController.getForm)
router.post('/', authorize('forms', 'create'), createFormValidator, validate, formController.createForm)
router.patch('/:id', authorize('forms', 'edit'), updateFormValidator, validate, formController.updateForm)
router.delete('/:id', authorize('forms', 'delete'), formIdValidator, validate, formController.deleteForm)

router.get('/:id/submissions', authorize('forms', 'view'), formIdValidator, validate, formController.listFormSubmissions)
router.get('/:id/submissions/export', authorize('forms', 'export'), formIdValidator, validate, formController.exportFormSubmissionsCsv)
router.delete('/:id/submissions/:submissionId', authorize('forms', 'edit'), formIdValidator, validate, formController.deleteFormSubmission)

export default router
