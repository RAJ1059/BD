import mongoose from 'mongoose'

const webhookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    events: [{ type: String, trim: true }], // free-form event names, e.g. 'lead.created'
    secret: { type: String, default: '' }, // used for HMAC signing of the payload
    isActive: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date, default: null },
    lastStatus: { type: String, enum: ['success', 'failed', null], default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Webhook = mongoose.model('Webhook', webhookSchema)
