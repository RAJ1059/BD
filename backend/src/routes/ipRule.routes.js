import { Router } from 'express'
import * as ipRuleController from '../controllers/ipRule.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createIpRuleValidator, ipRuleIdValidator } from '../validators/ipRule.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('settings', 'view'), ipRuleController.listIpRules)
router.post('/', authorize('settings', 'edit'), createIpRuleValidator, validate, ipRuleController.createIpRule)
router.delete('/:id', authorize('settings', 'edit'), ipRuleIdValidator, validate, ipRuleController.deleteIpRule)

export default router
