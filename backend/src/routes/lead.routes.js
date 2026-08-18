import { Router } from 'express'
import { body } from 'express-validator'
import * as leadController from '../controllers/lead.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authorize } from '../middlewares/rbac.js'
import { validate } from '../middlewares/validate.js'
import { upload } from '../middlewares/upload.js'
import {
  createLeadValidator,
  updateLeadValidator,
  updateLeadStatusValidator,
  addLeadNoteValidator,
  leadIdValidator,
} from '../validators/lead.validators.js'

const router = Router()

router.use(authenticate)

/**
 * @openapi
 * /leads:
 *   get:
 *     tags: [Leads]
 *     summary: List leads (paginated, filterable by status/source/assignedTo, full-text search)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [new, contacted, qualified, proposal, negotiation, won, lost] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of leads }
 *   post:
 *     tags: [Leads]
 *     summary: Create a lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName, contactPerson, email]
 *             properties:
 *               companyName: { type: string }
 *               contactPerson: { type: string }
 *               email: { type: string, format: email }
 *               source: { type: string }
 *               estimatedValue: { type: number }
 *     responses:
 *       201: { description: Lead created }
 */
router.get('/', authorize('leads', 'view'), leadController.listLeads)
router.get('/export', authorize('leads', 'export'), leadController.exportLeadsCsv)
router.post('/import', authorize('leads', 'create'), upload.single('file'), leadController.importLeadsCsv)
router.get('/:id', authorize('leads', 'view'), leadIdValidator, validate, leadController.getLead)
router.post('/', authorize('leads', 'create'), createLeadValidator, validate, leadController.createLead)
router.patch('/:id', authorize('leads', 'edit'), updateLeadValidator, validate, leadController.updateLead)
router.patch('/:id/status', authorize('leads', 'edit'), updateLeadStatusValidator, validate, leadController.updateLeadStatus)
router.post('/:id/notes', authorize('leads', 'edit'), addLeadNoteValidator, validate, leadController.addLeadNote)
router.post(
  '/:id/attachments',
  authorize('leads', 'edit'),
  leadIdValidator,
  body('mediaId').isMongoId(),
  validate,
  leadController.attachLeadFile
)
/**
 * @openapi
 * /leads/{id}/convert:
 *   post:
 *     tags: [Leads]
 *     summary: Convert a won lead into a CRM client record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Client created from lead }
 *       409: { description: Lead already converted }
 */
router.post('/:id/convert', authorize('leads', 'approve'), leadIdValidator, validate, leadController.convertLeadToClient)
router.delete('/:id', authorize('leads', 'delete'), leadIdValidator, validate, leadController.deleteLead)

export default router
