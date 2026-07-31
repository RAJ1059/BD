import { Router } from 'express'
import * as clientPortalController from '../controllers/clientPortal.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { ApiError } from '../utils/ApiError.js'

const router = Router()

router.use(authenticate)

// Every route here is self-service data scoped to req.user.client — never
// accepts an id param, so a Client-role account can only ever see its own data.
router.use((req, _res, next) => {
  if (req.user.role?.name !== 'Client') return next(ApiError.forbidden('Client portal is only available to Client accounts'))
  next()
})

router.get('/summary', clientPortalController.getSummary)
router.get('/profile', clientPortalController.getProfile)
router.get('/projects', clientPortalController.listProjects)

export default router
