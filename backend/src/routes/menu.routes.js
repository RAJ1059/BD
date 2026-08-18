import { Router } from 'express'
import * as menuController from '../controllers/menu.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createMenuValidator, updateMenuValidator, menuIdValidator } from '../validators/menu.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('menus', 'view'), menuController.listMenus)
router.get('/:id', authorize('menus', 'view'), menuIdValidator, validate, menuController.getMenu)

router.post('/', authorize('menus', 'create'), createMenuValidator, validate, menuController.createMenu)

router.patch(
  '/:id',
  menuIdValidator,
  validate,
  authorize('menus', 'edit'),
  updateMenuValidator,
  validate,
  menuController.updateMenu
)

router.delete('/:id', authorize('menus', 'delete'), menuIdValidator, validate, menuController.deleteMenu)

export default router
