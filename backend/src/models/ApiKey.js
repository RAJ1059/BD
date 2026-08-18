import mongoose from 'mongoose'

const apiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, select: false },
    keyPrefix: { type: String, required: true, index: true }, // first 8 chars of the raw key, safe to display
    scopes: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const ApiKey = mongoose.model('ApiKey', apiKeySchema)
