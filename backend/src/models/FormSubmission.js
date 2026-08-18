import mongoose from 'mongoose'

const submissionFileSchema = new mongoose.Schema(
  {
    fieldName: { type: String, default: '' },
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  },
  { _id: false }
)

const formSubmissionSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    files: [submissionFileSchema],
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    isSpam: { type: Boolean, default: false },
  },
  { timestamps: true }
)

formSubmissionSchema.index({ form: 1, createdAt: -1 })

export const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema)
