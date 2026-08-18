import mongoose from 'mongoose'
import { SOCIAL_PLATFORMS } from '../config/constants.js'

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true, unique: true },
    url: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },
    apiConnected: { type: Boolean, default: false }, // placeholder for future OAuth/API integration status
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const SocialLink = mongoose.model('SocialLink', socialLinkSchema)
