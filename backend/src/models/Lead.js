import mongoose from 'mongoose'
import { LEAD_SOURCES, LEAD_STATUSES } from '../config/constants.js'

const attachmentSchema = new mongoose.Schema(
  {
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    label: { type: String, default: '' },
    category: { type: String, enum: ['file', 'image', 'pdf', 'agreement'], default: 'file' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const noteSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const leadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    industry: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },

    source: { type: String, enum: LEAD_SOURCES, default: 'website' },
    status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
    estimatedValue: { type: Number, default: 0 },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [attachmentSchema],
    notes: [noteSchema],

    convertedToClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    lostReason: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

leadSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' })
leadSchema.index({ status: 1, createdAt: -1 })

export const Lead = mongoose.model('Lead', leadSchema)
