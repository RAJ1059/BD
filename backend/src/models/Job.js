import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // free-form, e.g. 'send-email'
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending', index: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastError: { type: String, default: '' },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

export const Job = mongoose.model('Job', jobSchema)
