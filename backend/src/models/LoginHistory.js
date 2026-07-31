import mongoose from 'mongoose'

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    email: { type: String },
    success: { type: Boolean, required: true },
    reason: { type: String, default: '' }, // e.g. "invalid_password", "account_disabled"
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  },
  { timestamps: true }
)

export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema)
