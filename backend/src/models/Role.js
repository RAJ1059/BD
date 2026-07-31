import mongoose from 'mongoose'
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from '../config/constants.js'

const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, enum: PERMISSION_MODULES, required: true },
    actions: [{ type: String, enum: PERMISSION_ACTIONS }],
  },
  { _id: false }
)

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: '' },
    isSystem: { type: Boolean, default: false }, // system roles cannot be deleted
    permissions: [permissionSchema],
  },
  { timestamps: true }
)

roleSchema.methods.hasPermission = function hasPermission(module, action) {
  const entry = this.permissions.find((p) => p.module === module)
  return Boolean(entry && entry.actions.includes(action))
}

export const Role = mongoose.model('Role', roleSchema)
