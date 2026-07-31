import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
)

export const Tag = mongoose.model('Tag', tagSchema)
