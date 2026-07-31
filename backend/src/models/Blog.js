import mongoose from 'mongoose'
import { BLOG_STATUSES } from '../config/constants.js'

const revisionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    approved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
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

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true }, // rich text HTML (supports embedded code blocks / video embeds)

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    featuredImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    gallery: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],

    status: { type: String, enum: BLOG_STATUSES, default: 'draft', index: true },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false },

    readingTimeMinutes: { type: Number, default: 1 },
    viewCount: { type: Number, default: 0 },

    seo: { type: seoSchema, default: () => ({}) },
    relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],

    revisions: [revisionSchema],
    comments: [commentSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' })
blogSchema.index({ status: 1, publishedAt: -1 })

export const Blog = mongoose.model('Blog', blogSchema)
