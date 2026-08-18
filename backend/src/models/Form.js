import mongoose from 'mongoose'
import { FORM_FIELD_TYPES } from '../config/constants.js'

const formFieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: FORM_FIELD_TYPES, required: true },
    required: { type: Boolean, default: false },
    options: [String],
    placeholder: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
)

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    fields: [formFieldSchema],
    notificationEmails: [{ type: String, trim: true }],
    successMessage: { type: String, default: 'Thank you! We will be in touch shortly.' },
    isActive: { type: Boolean, default: true },
    allowFileUpload: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Form = mongoose.model('Form', formSchema)
