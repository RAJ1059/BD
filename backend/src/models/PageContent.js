import mongoose from 'mongoose'
import { PAGE_CONTENT_KEYS } from '../config/constants.js'

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
  },
  { _id: false }
)

const pageContentSchema = new mongoose.Schema(
  {
    pageKey: { type: String, required: true, unique: true, enum: PAGE_CONTENT_KEYS },
    sections: { type: mongoose.Schema.Types.Mixed, default: {} },
    seo: { type: seoSchema, default: () => ({}) },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const PageContent = mongoose.model('PageContent', pageContentSchema)
