import { catchAsync } from '../utils/catchAsync.js'
import { ok } from '../utils/ApiResponse.js'
import { Client } from '../models/Client.js'
import { Project } from '../models/Project.js'
import { Lead } from '../models/Lead.js'
import { Blog } from '../models/Blog.js'
import { User } from '../models/User.js'
import { ActivityLog } from '../models/ActivityLog.js'
import { Task } from '../models/Task.js'
import { Campaign } from '../models/Campaign.js'
import { CampaignClick } from '../models/CampaignClick.js'
import { FormSubmission } from '../models/FormSubmission.js'
import { SocialClick } from '../models/SocialClick.js'
import { fetchIntegrationReport } from '../services/integrations/index.js'

// A widget whose data source (invoicing, ads platforms, email marketing, ...)
// hasn't been wired up yet. The dashboard UI renders these as "Connect X"
// cards instead of fabricating numbers, so nothing ever looks real until it is.
function notConnected(reason) {
  return { available: false, reason }
}

export const getSummary = catchAsync(async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const now = new Date()

  const [
    activeClients,
    runningProjects,
    completedProjects,
    publishedBlogPosts,
    totalLeads,
    newLeadsThisWeek,
    recentActivity,
    tasksDueSoon,
    tasksOverdue,
    totalCampaigns,
    campaignClicksAgg,
    formSubmissionsTotal,
    formSubmissionsThisWeek,
    socialClicksTotal,
    socialClicksByPlatform,
  ] = await Promise.all([
    Client.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'in_progress' }),
    Project.countDocuments({ status: 'completed' }),
    Blog.countDocuments({ status: 'published' }),
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ActivityLog.find().populate('actor', 'name avatar').sort('-createdAt').limit(10),
    Task.countDocuments({ status: { $ne: 'done' }, dueDate: { $lte: sevenDaysFromNow } }),
    Task.countDocuments({ status: { $ne: 'done' }, dueDate: { $lt: now } }),
    Campaign.countDocuments(),
    Campaign.aggregate([{ $group: { _id: null, totalClicks: { $sum: '$clickCount' } } }]),
    FormSubmission.countDocuments(),
    FormSubmission.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    SocialClick.countDocuments(),
    SocialClick.aggregate([
      { $match: { clickedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ])

  return ok(res, {
    activeClients,
    runningProjects,
    completedProjects,
    blogPosts: publishedBlogPosts,
    leads: { total: totalLeads, newThisWeek: newLeadsThisWeek },
    revenue: notConnected('Connect an invoicing workflow (Invoices module) to see revenue'),
    pendingPayments: notConnected('Connect an invoicing workflow to see pending payments'),
    quotationsSent: notConnected('Quotation Generator module is not yet enabled'),
    invoices: notConnected('Invoice Generator module is not yet enabled'),
    googleAdsPerformance: notConnected('Connect Google Ads in Settings > Integrations'),
    facebookAdsPerformance: notConnected('Connect Meta Ads in Settings > Integrations'),
    activeCampaigns: { available: true, total: totalCampaigns, totalClicks: campaignClicksAgg[0]?.totalClicks || 0 },
    tasksDue: { available: true, dueSoon: tasksDueSoon, overdue: tasksOverdue },
    formSubmissions: { available: true, total: formSubmissionsTotal, thisWeek: formSubmissionsThisWeek },
    socialClicks: {
      available: true,
      totalClicks: socialClicksTotal,
      byPlatform: socialClicksByPlatform.map((r) => ({ platform: r._id, count: r.count })),
    },
    notifications: notConnected('Notification center is not yet enabled'),
    calendar: notConnected('Calendar integration is not yet enabled'),
    recentActivity,
  }, 'Dashboard summary')
})

export const getCharts = catchAsync(async (req, res) => {
  const months = Number(req.query.months) || 6
  const since = new Date()
  since.setMonth(since.getMonth() - months)

  const [leadSource, projectStatus, leadsByMonth, teamPerformance] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    ActivityLog.aggregate([
      { $match: { createdAt: { $gte: since }, actor: { $ne: null } } },
      { $group: { _id: '$actor', actions: { $sum: 1 } } },
      { $sort: { actions: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', actions: 1 } },
    ]),
  ])

  const conversionRate = leadsByMonth.map((row) => ({
    period: `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
    total: row.total,
    won: row.won,
    rate: row.total ? Math.round((row.won / row.total) * 1000) / 10 : 0,
  }))

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [topCampaigns, clicksByDayAgg] = await Promise.all([
    Campaign.find().sort('-clickCount').limit(5).select('name utmSource utmMedium clickCount'),
    CampaignClick.aggregate([
      { $match: { clickedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ])

  const campaignRoi = {
    available: true,
    note: 'Click-through performance from UTM campaigns; connect Google/Meta Ads in Integrations for spend-based ROI',
    topCampaigns: topCampaigns.map((c) => ({ name: c.name, source: c.utmSource, medium: c.utmMedium, clickCount: c.clickCount })),
    clicksByDay: clicksByDayAgg.map((r) => ({ date: r._id, count: r.count })),
  }

  let trafficGraph = notConnected('Connect Google Analytics 4 in Settings > Integrations')
  try {
    const ga4 = await fetchIntegrationReport('google_analytics')
    if (ga4.available) {
      trafficGraph = { available: true, ...ga4.data }
    } else {
      trafficGraph = notConnected(ga4.reason || 'Connect Google Analytics 4 in Settings > Integrations')
    }
  } catch (err) {
    trafficGraph = notConnected(err.message)
  }

  return ok(res, {
    leadSource: leadSource.map((r) => ({ source: r._id, count: r.count })),
    projectStatus: projectStatus.map((r) => ({ status: r._id, count: r.count })),
    conversionRate,
    teamPerformance,
    monthlyRevenue: notConnected('Connect Invoices to chart monthly revenue'),
    trafficGraph,
    campaignRoi,
  }, 'Dashboard charts')
})

export const teamOverview = catchAsync(async (_req, res) => {
  const total = await User.countDocuments()
  const byRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'role' } },
    { $unwind: '$role' },
    { $project: { name: '$role.name', count: 1 } },
  ])
  return ok(res, { total, byRole }, 'Team overview')
})
