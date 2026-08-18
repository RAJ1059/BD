import mongoose from 'mongoose'

const campaignClickSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  ip: { type: String, default: '' },
  clickedAt: { type: Date, default: Date.now },
})

campaignClickSchema.index({ campaign: 1, clickedAt: -1 })

export const CampaignClick = mongoose.model('CampaignClick', campaignClickSchema)
