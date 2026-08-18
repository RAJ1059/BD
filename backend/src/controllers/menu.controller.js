import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Menu } from '../models/Menu.js'
import { generateUniqueSlug } from '../utils/slugify.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta, parseSort } from '../utils/pagination.js'

const POPULATE = ['items.page']

export const listMenus = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const sort = parseSort(req.query.sort, ['name', 'createdAt'])

  const filter = {}
  if (req.query.location) filter.location = req.query.location
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  const [items, total] = await Promise.all([
    Menu.find(filter).populate(POPULATE).sort(sort).skip(skip).limit(limit),
    Menu.countDocuments(filter),
  ])

  return ok(res, items, 'Menus', buildMeta({ page, limit, total }))
})

export const getMenu = catchAsync(async (req, res) => {
  const menu = await Menu.findById(req.params.id).populate(POPULATE)
  if (!menu) throw ApiError.notFound('Menu not found')
  return ok(res, menu, 'Menu')
})

export const createMenu = catchAsync(async (req, res) => {
  const { name } = req.body
  const slug = await generateUniqueSlug(Menu, name)

  const menu = await Menu.create({
    ...req.body,
    slug,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  })

  await recordActivity(req, { action: 'create', module: 'menus', targetId: menu._id, description: `Created menu "${menu.name}"` })
  return created(res, menu, 'Menu created')
})

export const updateMenu = catchAsync(async (req, res) => {
  const menu = await Menu.findById(req.params.id)
  if (!menu) throw ApiError.notFound('Menu not found')

  const before = menu.toObject()
  const { name } = req.body

  if (name !== undefined && name !== menu.name) {
    menu.name = name
    menu.slug = await generateUniqueSlug(Menu, name, { excludeId: menu._id })
  }

  const assignable = ['location', 'isActive', 'items']
  for (const field of assignable) {
    if (req.body[field] !== undefined) menu[field] = req.body[field]
  }

  menu.updatedBy = req.user._id
  await menu.save()

  await recordActivity(req, {
    action: 'update',
    module: 'menus',
    targetId: menu._id,
    description: `Updated menu "${menu.name}"`,
    changes: { before: { name: before.name, location: before.location }, after: { name: menu.name, location: menu.location } },
  })
  return ok(res, menu, 'Menu updated')
})

export const deleteMenu = catchAsync(async (req, res) => {
  const menu = await Menu.findById(req.params.id)
  if (!menu) throw ApiError.notFound('Menu not found')

  await menu.deleteOne()
  await recordActivity(req, { action: 'delete', module: 'menus', targetId: menu._id, description: `Deleted menu "${menu.name}"` })
  return noContent(res, 'Menu deleted')
})
