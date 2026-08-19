import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: 'FiZap' },
    summary: { type: String, default: '' },
    description: { type: String, default: '' },
    features: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

serviceSchema.index({ order: 1 })

export const Service = mongoose.model('Service', serviceSchema)
