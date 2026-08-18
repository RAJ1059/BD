import mongoose from 'mongoose'
import { REDIRECT_TYPES } from '../config/constants.js'

const redirectSchema = new mongoose.Schema(
  {
    fromPath: { type: String, required: true, unique: true, index: true, trim: true },
    toPath: { type: String, required: true, trim: true },
    statusCode: { type: Number, enum: REDIRECT_TYPES, default: 301 },
    isActive: { type: Boolean, default: true },
    hitCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Redirect = mongoose.model('Redirect', redirectSchema)
