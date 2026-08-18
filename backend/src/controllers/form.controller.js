import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Form } from '../models/Form.js'
import { FormSubmission } from '../models/FormSubmission.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'
import { exportToCsv } from '../utils/csv.js'

// Hard cap on export size so a runaway form doesn't produce a multi-GB CSV.
const EXPORT_MAX_ROWS = 10000

export const listForms = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)

  const filter = {}
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  const [items, total] = await Promise.all([
    Form.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Form.countDocuments(filter),
  ])

  return ok(res, items, 'Forms', buildMeta({ page, limit, total }))
})

export const getForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id)
  if (!form) throw ApiError.notFound('Form not found')
  return ok(res, form, 'Form')
})

export const createForm = catchAsync(async (req, res) => {
  const slug = await generateUniqueSlug(Form, req.body.name)
  const form = await Form.create({ ...req.body, slug, createdBy: req.user._id })
  await recordActivity(req, { action: 'create', module: 'forms', targetId: form._id, description: `Created form "${form.name}"` })
  return created(res, form, 'Form created')
})

export const updateForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id)
  if (!form) throw ApiError.notFound('Form not found')

  const before = form.toObject()
  if (req.body.name && req.body.name !== form.name) {
    form.slug = await generateUniqueSlug(Form, req.body.name, { excludeId: form._id })
  }
  Object.assign(form, req.body, { updatedBy: req.user._id })
  await form.save()

  await recordActivity(req, {
    action: 'update',
    module: 'forms',
    targetId: form._id,
    description: `Updated form "${form.name}"`,
    changes: { before, after: form.toObject() },
  })
  return ok(res, form, 'Form updated')
})

export const deleteForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id)
  if (!form) throw ApiError.notFound('Form not found')

  await form.deleteOne()
  await FormSubmission.deleteMany({ form: form._id })
  await recordActivity(req, { action: 'delete', module: 'forms', targetId: form._id, description: `Deleted form "${form.name}"` })
  return noContent(res, 'Form deleted')
})

export const listFormSubmissions = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id)
  if (!form) throw ApiError.notFound('Form not found')

  const { page, limit, skip } = parsePagination(req.query)

  const filter = { form: form._id }
  if (req.query.isSpam !== undefined) filter.isSpam = req.query.isSpam === 'true'

  const [items, total] = await Promise.all([
    FormSubmission.find(filter).populate('files.media').sort('-createdAt').skip(skip).limit(limit),
    FormSubmission.countDocuments(filter),
  ])

  return ok(res, items, 'Form submissions', buildMeta({ page, limit, total }))
})

export const deleteFormSubmission = catchAsync(async (req, res) => {
  const submission = await FormSubmission.findOne({ _id: req.params.submissionId, form: req.params.id })
  if (!submission) throw ApiError.notFound('Submission not found')

  await submission.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'forms', targetId: req.params.id, description: 'Deleted a form submission' })
  return noContent(res, 'Submission deleted')
})

export const exportFormSubmissionsCsv = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id)
  if (!form) throw ApiError.notFound('Form not found')

  const submissions = await FormSubmission.find({ form: form._id }).sort('-createdAt').limit(EXPORT_MAX_ROWS)

  const fields = [...form.fields].sort((a, b) => a.order - b.order)
  const columns = [
    ...fields.map((f) => ({ key: f.name, header: f.label })),
    { key: 'submittedAt', header: 'Submitted At' },
  ]
  const rows = submissions.map((s) => ({
    ...s.data,
    submittedAt: s.createdAt.toISOString(),
  }))

  exportToCsv(res, `${form.slug}-submissions.csv`, columns, rows)
})
