import { Router } from 'express'
import * as integrationController from '../controllers/integration.controller.js'

// Unauthenticated on purpose — Google redirects the user's browser here
// directly with no Authorization header. Trust is established via the
// signed `state` param verified inside googleOAuthCallback.
const router = Router()

router.get('/callback', integrationController.googleOAuthCallback)

export default router
