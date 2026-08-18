import mongoose from 'mongoose'
import { INTEGRATION_PROVIDERS } from '../config/constants.js'

const integrationSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: INTEGRATION_PROVIDERS, required: true, unique: true },
    isConnected: { type: Boolean, default: false },
    // Provider-specific shape (e.g. google_analytics: {propertyId, accessToken},
    // meta_ads: {accessToken, adAccountId}) — intentionally loose since each
    // provider's credential shape differs.
    credentials: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastSyncedAt: { type: Date, default: null },
    lastError: { type: String, default: '' },
    connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

integrationSchema.statics.upsertCredentials = async function upsertCredentials(provider, credentials, connectedBy) {
  return this.findOneAndUpdate(
    { provider },
    { credentials, isConnected: true, connectedBy },
    { upsert: true, new: true }
  )
}

export const Integration = mongoose.model('Integration', integrationSchema)
