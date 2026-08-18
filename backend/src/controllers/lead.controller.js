import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Lead } from '../models/Lead.js'
import { Client } from '../models/Client.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'
import { exportToCsv, parseCsvBuffer } from '../utils/csv.js'

// Hard cap on export size so a filter-less export can't return millions of rows.
const EXPORT_MAX_ROWS = 10000

const LEAD_CSV_COLUMNS = [
  { key: 'companyName', header: 'companyName' },
  { key: 'contactPerson', header: 'contactPerson' },
  { key: 'email', header: 'email' },
  { key: 'phone', header: 'phone' },
  { key: 'whatsapp', header: 'whatsapp' },
  { key: 'website', header: 'website' },
  { key: 'industry', header: 'industry' },
  { key: 'country', header: 'country' },
  { key: 'source', header: 'source' },
  { key: 'status', header: 'status' },
  { key: 'estimatedValue', header: 'estimatedValue' },
  { key: 'createdAt', header: 'createdAt' },
]

export const listLeads = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['companyName', 'createdAt', 'estimatedValue', 'status'])

  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.source) filter.source = req.query.source
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
  if (req.query.search) filter.$text = { $search: req.query.search }

  const [items, total] = await Promise.all([
    Lead.find(filter).populate('assignedTo', 'name avatar').sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ])

  return ok(res, items, 'Leads', buildMeta({ page, limit, total }))
})

export const getLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name avatar').populate('notes.author', 'name avatar').populate('attachments.media')
  if (!lead) throw ApiError.notFound('Lead not found')
  return ok(res, lead, 'Lead')
})

export const createLead = catchAsync(async (req, res) => {
  const lead = await Lead.create({ ...req.body, createdBy: req.user._id })
  await recordActivity(req, { action: 'create', module: 'leads', targetId: lead._id, description: `Created lead "${lead.companyName}"` })
  return created(res, lead, 'Lead created')
})

export const updateLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead not found')

  const before = lead.toObject()
  Object.assign(lead, req.body)
  await lead.save()

  await recordActivity(req, {
    action: 'update',
    module: 'leads',
    targetId: lead._id,
    description: `Updated lead "${lead.companyName}"`,
    changes: { before, after: lead.toObject() },
  })
  return ok(res, lead, 'Lead updated')
})

export const updateLeadStatus = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead not found')

  const { status, lostReason } = req.body
  lead.status = status
  if (status === 'lost') lead.lostReason = lostReason || lead.lostReason

  await lead.save()
  await recordActivity(req, { action: 'status_change', module: 'leads', targetId: lead._id, description: `Lead "${lead.companyName}" moved to ${status}` })
  return ok(res, lead, 'Lead status updated')
})

export const addLeadNote = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead not found')

  lead.notes.push({ author: req.user._id, text: req.body.text })
  await lead.save()
  await recordActivity(req, { action: 'note', module: 'leads', targetId: lead._id, description: `Added a note to "${lead.companyName}"` })
  return ok(res, lead, 'Note added')
})

export const attachLeadFile = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead not found')

  const { mediaId, label = '', category = 'file' } = req.body
  lead.attachments.push({ media: mediaId, label, category })
  await lead.save()
  await recordActivity(req, { action: 'attach', module: 'leads', targetId: lead._id, description: `Attached a file to "${lead.companyName}"` })
  return ok(res, lead, 'File attached')
})

export const convertLeadToClient = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead not found')
  if (lead.convertedToClient) throw ApiError.conflict('Lead has already been converted')

  const client = await Client.create({
    companyName: lead.companyName,
    contactPerson: lead.contactPerson,
    email: lead.email,
    phone: lead.phone,
    whatsapp: lead.whatsapp,
    website: lead.website,
    industry: lead.industry,
    country: lead.country,
    address: lead.address,
    attachments: lead.attachments,
    convertedFromLead: lead._id,
    accountManager: lead.assignedTo,
    createdBy: req.user._id,
  })

  lead.status = 'won'
  lead.convertedToClient = client._id
  await lead.save()

  await recordActivity(req, { action: 'convert', module: 'leads', targetId: lead._id, description: `Converted lead "${lead.companyName}" to a client` })
  return created(res, client, 'Lead converted to client')
})

export const deleteLead = catchAsync(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead not found')

  await lead.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'leads', targetId: lead._id, description: `Deleted lead "${lead.companyName}"` })
  return noContent(res, 'Lead deleted')
})

export const exportLeadsCsv = catchAsync(async (req, res) => {
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.source) filter.source = req.query.source
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
  if (req.query.search) filter.$text = { $search: req.query.search }

  const leads = await Lead.find(filter).sort('-createdAt').limit(EXPORT_MAX_ROWS).lean()
  const rows = leads.map((l) => ({ ...l, createdAt: l.createdAt?.toISOString() }))

  exportToCsv(res, 'leads.csv', LEAD_CSV_COLUMNS, rows)
})

export const importLeadsCsv = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded')

  const csvRows = parseCsvBuffer(req.file.buffer)

  const rows = csvRows.map((row) => ({
    companyName: row.companyName,
    contactPerson: row.contactPerson,
    email: row.email,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    website: row.website || '',
    industry: row.industry || '',
    country: row.country || '',
    source: row.source || undefined,
    status: row.status || undefined,
    estimatedValue: row.estimatedValue ? Number(row.estimatedValue) : 0,
    createdBy: req.user._id,
  }))

  let imported = 0
  let failed = 0
  const errors = []

  try {
    const result = await Lead.insertMany(rows, { ordered: false })
    imported = result.length
    failed = rows.length - imported
  } catch (err) {
    const writeErrors = err.writeErrors || []
    imported = rows.length - writeErrors.length
    failed = writeErrors.length
    errors.push(...writeErrors.slice(0, 10).map((e) => e.err?.errmsg || e.errmsg || e.message))
    if (!writeErrors.length) errors.push(err.message)
  }

  await recordActivity(req, { action: 'import', module: 'leads', description: `Imported ${imported} leads` })
  return created(res, { imported, failed, errors }, `Imported ${imported} leads`)
})
