import { Router } from 'express'
import * as taskController from '../controllers/task.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createTaskValidator, updateTaskValidator, taskIdValidator } from '../validators/task.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('tasks', 'view'), taskController.listTasks)
router.get('/:id', authorize('tasks', 'view'), taskIdValidator, validate, taskController.getTask)
router.post('/', authorize('tasks', 'create'), createTaskValidator, validate, taskController.createTask)
router.patch('/:id', authorize('tasks', 'edit'), updateTaskValidator, validate, taskController.updateTask)
router.delete('/:id', authorize('tasks', 'delete'), taskIdValidator, validate, taskController.deleteTask)

export default router
