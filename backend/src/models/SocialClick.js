import mongoose from 'mongoose'

const socialClickSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  clickedAt: { type: Date, default: Date.now },
})

socialClickSchema.index({ platform: 1, clickedAt: -1 })

export const SocialClick = mongoose.model('SocialClick', socialClickSchema)
