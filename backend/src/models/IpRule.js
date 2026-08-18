import mongoose from 'mongoose'

const ipRuleSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['allow', 'block'], required: true },
    note: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const IpRule = mongoose.model('IpRule', ipRuleSchema)
