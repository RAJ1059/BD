import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { IpRule } from '../models/IpRule.js'
import { recordActivity } from '../services/activityLog.service.js'

export const listIpRules = catchAsync(async (_req, res) => {
  const rules = await IpRule.find().sort('-createdAt')
  return ok(res, rules, 'IP rules')
})

export const createIpRule = catchAsync(async (req, res) => {
  const existing = await IpRule.findOne({ ip: req.body.ip })
  if (existing) throw ApiError.conflict('A rule for this IP already exists')

  const rule = await IpRule.create({ ...req.body, createdBy: req.user._id })

  await recordActivity(req, { action: 'create', module: 'settings', targetId: rule._id, description: `Created ${rule.type} rule for IP ${rule.ip}` })
  return created(res, rule, 'IP rule created')
})

export const deleteIpRule = catchAsync(async (req, res) => {
  const rule = await IpRule.findById(req.params.id)
  if (!rule) throw ApiError.notFound('IP rule not found')

  await rule.deleteOne()

  await recordActivity(req, { action: 'delete', module: 'settings', targetId: rule._id, description: `Deleted IP rule for ${rule.ip}` })
  return noContent(res, 'IP rule deleted')
})
