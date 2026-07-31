import { Router } from 'express'
import * as projectController from '../controllers/project.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createProjectValidator, updateProjectValidator, projectIdValidator } from '../validators/project.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('projects', 'view'), projectController.listProjects)
router.get('/:id', authorize('projects', 'view'), projectIdValidator, validate, projectController.getProject)
router.post('/', authorize('projects', 'create'), createProjectValidator, validate, projectController.createProject)
router.patch('/:id', authorize('projects', 'edit'), updateProjectValidator, validate, projectController.updateProject)
router.delete('/:id', authorize('projects', 'delete'), projectIdValidator, validate, projectController.deleteProject)

export default router
