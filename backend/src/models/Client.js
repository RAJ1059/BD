import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema(
  {
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    label: { type: String, default: '' },
    category: { type: String, enum: ['file', 'image', 'pdf', 'agreement'], default: 'file' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const projectHistoryEntrySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const clientSchema = new mongoose.Schema(
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

    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    attachments: [attachmentSchema],
    projectHistory: [projectHistoryEntrySchema],

    convertedFromLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    accountManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, trim: true }],
    notes: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

clientSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' })

export const Client = mongoose.model('Client', clientSchema)
