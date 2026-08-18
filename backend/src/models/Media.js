import mongoose from 'mongoose'
import { MEDIA_TYPES } from '../config/constants.js'

const mediaSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    type: { type: String, enum: MEDIA_TYPES, default: 'other' },
    size: { type: Number, required: true }, // bytes
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    thumbnailKey: { type: String, default: '' },
    webpUrl: { type: String, default: '' },
    webpKey: { type: String, default: '' },
    storageDriver: { type: String, enum: ['local', 's3', 'cloudinary'], default: 'local' },
    storageKey: { type: String, required: true }, // relative path or S3 key
    folder: { type: String, default: 'general' },
    width: { type: Number },
    height: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
)

mediaSchema.index({ folder: 1, createdAt: -1 })
mediaSchema.index({ originalName: 'text', tags: 'text' })

export const Media = mongoose.model('Media', mediaSchema)
