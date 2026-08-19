import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok } from '../utils/ApiResponse.js'
import { PageContent } from '../models/PageContent.js'
import { recordActivity } from '../services/activityLog.service.js'
import { PAGE_CONTENT_KEYS } from '../config/constants.js'

const POPULATE = ['seo.ogImage']

// Every pageKey should always have a row, so the admin never sees a missing
// page — first read silently creates any that are missing (empty sections).
async function ensureAllExist() {
  const existing = await PageContent.find().select('pageKey')
  const existingKeys = new Set(existing.map((p) => p.pageKey))
  const missing = PAGE_CONTENT_KEYS.filter((key) => !existingKeys.has(key))
  if (missing.length) {
    await PageContent.insertMany(missing.map((pageKey) => ({ pageKey, sections: {} })))
  }
}

export const listPageContents = catchAsync(async (_req, res) => {
  await ensureAllExist()
  const items = await PageContent.find().sort('pageKey').select('pageKey updatedAt')
  return ok(res, items, 'Page content')
})

export const getPageContent = catchAsync(async (req, res) => {
  await ensureAllExist()
  const item = await PageContent.findOne({ pageKey: req.params.pageKey }).populate(POPULATE)
  if (!item) throw ApiError.notFound('Page content not found')
  return ok(res, item, 'Page content')
})

export const updatePageContent = catchAsync(async (req, res) => {
  const item = await PageContent.findOne({ pageKey: req.params.pageKey })
  if (!item) throw ApiError.notFound('Page content not found')

  if (req.body.sections !== undefined) item.sections = req.body.sections
  if (req.body.seo !== undefined) item.seo = req.body.seo
  item.updatedBy = req.user._id
  await item.save()

  await recordActivity(req, {
    action: 'update',
    module: 'pageContent',
    targetId: item._id,
    description: `Updated page content "${item.pageKey}"`,
  })
  return ok(res, item, 'Page content updated')
})
