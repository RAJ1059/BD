import mongoose from 'mongoose'
import { SCRIPT_PROVIDERS, SCRIPT_PLACEMENTS } from '../config/constants.js'

const versionSchema = new mongoose.Schema(
  {
    code: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

// Whether a script is "currently active" also depends on scheduleStart/scheduleEnd
// vs. the current time, which is inherently a read-time concern (not something
// that should be cached on the document). That logic lives in
// services/scriptRenderer.service.js instead of a schema method here, so it
// can't drift out of sync with "now" or leak into API responses/serialization.
const scriptSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // admin-facing label, e.g. "GA4 Production"
    provider: { type: String, enum: SCRIPT_PROVIDERS, required: true },
    placement: { type: String, enum: SCRIPT_PLACEMENTS, required: true },
    code: { type: String, required: true }, // tracking ID for known providers OR raw HTML/CSS/JS for custom_*
    isActive: { type: Boolean, default: true },
    targetPages: [{ type: String }], // empty array = all pages
    scheduleStart: { type: Date, default: null },
    scheduleEnd: { type: Date, default: null },

    versions: [versionSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

scriptSchema.index({ placement: 1, isActive: 1 })

export const Script = mongoose.model('Script', scriptSchema)
