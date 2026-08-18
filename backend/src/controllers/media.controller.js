import path from 'node:path'
import crypto from 'node:crypto'
import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created, noContent } from '../utils/ApiResponse.js'
import { Media } from '../models/Media.js'
import { storageService } from '../services/storage.service.js'
import { optimizeImage, isOptimizableImage, convertToWebp } from '../services/image.service.js'
import { recordActivity } from '../services/activityLog.service.js'
import { parsePagination, buildMeta } from '../utils/pagination.js'

function mediaTypeFromMime(mimeType) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf' || mimeType.includes('word')) return 'document'
  return 'other'
}

export const uploadMedia = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded')

  const { originalname, mimetype, buffer, size } = req.file
  const folder = req.body.folder || 'general'
  const ext = path.extname(originalname) || ''
  const baseName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
  const key = path.posix.join(folder, `${baseName}${ext}`)

  let width
  let height
  let thumbnailUrl = ''
  let thumbnailKey = ''
  let webpUrl = ''
  let webpKey = ''
  let fileBuffer = buffer

  if (isOptimizableImage(mimetype)) {
    const optimized = await optimizeImage(buffer, { mimeType: mimetype })
    fileBuffer = optimized.buffer
    width = optimized.width
    height = optimized.height

    const thumbKey = path.posix.join(folder, `${baseName}-thumb.jpg`)
    const thumbSaved = await storageService.save(optimized.thumbnail, { key: thumbKey, mimeType: 'image/jpeg' })
    thumbnailUrl = thumbSaved.url
    thumbnailKey = thumbSaved.storageKey

    if (req.body.convertToWebp === 'true') {
      const webpBuffer = await convertToWebp(buffer)
      const webpFileKey = path.posix.join(folder, `${baseName}.webp`)
      const webpSaved = await storageService.save(webpBuffer, { key: webpFileKey, mimeType: 'image/webp' })
      webpUrl = webpSaved.url
      webpKey = webpSaved.storageKey
    }
  }

  const saved = await storageService.save(fileBuffer, { key, mimeType: mimetype })

  const media = await Media.create({
    fileName: path.basename(key),
    originalName: originalname,
    mimeType: mimetype,
    type: mediaTypeFromMime(mimetype),
    size,
    url: saved.url,
    thumbnailUrl,
    thumbnailKey,
    webpUrl,
    webpKey,
    storageDriver: saved.storageDriver,
    storageKey: saved.storageKey,
    folder,
    width,
    height,
    uploadedBy: req.user._id,
    tags: req.body.tags ? String(req.body.tags).split(',').map((t) => t.trim()) : [],
  })

  await recordActivity(req, { action: 'upload', module: 'media', targetId: media._id, description: `Uploaded "${media.originalName}"` })
  return created(res, media, 'File uploaded')
})

export const listMedia = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 })

  const filter = {}
  if (req.query.folder) filter.folder = req.query.folder
  if (req.query.type) filter.type = req.query.type
  if (req.query.search) filter.$text = { $search: req.query.search }

  const [items, total] = await Promise.all([
    Media.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('uploadedBy', 'name'),
    Media.countDocuments(filter),
  ])

  return ok(res, items, 'Media library', buildMeta({ page, limit, total }))
})

export const getMedia = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id)
  if (!media) throw ApiError.notFound('Media not found')
  return ok(res, media, 'Media')
})

export const deleteMedia = catchAsync(async (req, res) => {
  const media = await Media.findById(req.params.id)
  if (!media) throw ApiError.notFound('Media not found')

  await storageService.remove({ storageDriver: media.storageDriver, storageKey: media.storageKey })
  if (media.thumbnailKey) {
    await storageService.remove({ storageDriver: media.storageDriver, storageKey: media.thumbnailKey })
  }
  if (media.webpKey) {
    await storageService.remove({ storageDriver: media.storageDriver, storageKey: media.webpKey })
  }
  await media.deleteOne()

  await recordActivity(req, { action: 'delete', module: 'media', targetId: media._id, description: `Deleted "${media.originalName}"` })
  return noContent(res, 'File deleted')
})
