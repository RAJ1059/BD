import mongoose from 'mongoose'
import { MENU_LOCATIONS } from '../config/constants.js'

const menuItemSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, default: '' }, // external URL or internal path
    page: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null }, // links to an internal CMS page instead of a raw URL
    order: { type: Number, default: 0 },
    target: { type: String, enum: ['_self', '_blank'], default: '_self' },
    icon: { type: String, default: '' },
    parent: { type: mongoose.Schema.Types.ObjectId, default: null }, // _id of another item in this same array, for nested/dropdown menus
  },
  { _id: true }
)

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    location: { type: String, enum: MENU_LOCATIONS, required: true },
    isActive: { type: Boolean, default: true },

    items: [menuItemSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Menu = mongoose.model('Menu', menuSchema)
