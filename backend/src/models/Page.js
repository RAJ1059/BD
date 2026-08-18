import mongoose from 'mongoose'
import { PAGE_STATUSES } from '../config/constants.js'

const revisionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    ogImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    schemaMarkup: { type: String, default: '' }, // raw JSON-LD, admin managed
    focusKeyword: { type: String, default: '' },
  },
  { _id: false }
)

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true }, // rich text HTML

    template: { type: String, default: 'default' }, // frontend layout to render this page with

    featuredImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },

    status: { type: String, enum: PAGE_STATUSES, default: 'draft', index: true },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },

    seo: { type: seoSchema, default: () => ({}) },

    revisions: [revisionSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

pageSchema.index({ title: 'text', content: 'text' })
pageSchema.index({ status: 1, publishedAt: -1 })

export const Page = mongoose.model('Page', pageSchema)
