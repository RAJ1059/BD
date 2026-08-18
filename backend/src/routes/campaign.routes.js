import { Router } from 'express'
import * as campaignController from '../controllers/campaign.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { createCampaignValidator, updateCampaignValidator, campaignIdValidator } from '../validators/campaign.validators.js'

const router = Router()

router.use(authenticate)

router.get('/', authorize('utm', 'view'), campaignController.listCampaigns)
router.get('/:id', authorize('utm', 'view'), campaignIdValidator, validate, campaignController.getCampaign)
router.get('/:id/analytics', authorize('utm', 'view'), campaignIdValidator, validate, campaignController.campaignAnalytics)

router.post('/', authorize('utm', 'create'), createCampaignValidator, validate, campaignController.createCampaign)

router.patch('/:id', authorize('utm', 'edit'), updateCampaignValidator, validate, campaignController.updateCampaign)

router.delete('/:id', authorize('utm', 'delete'), campaignIdValidator, validate, campaignController.deleteCampaign)

export default router
