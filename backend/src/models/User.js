import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    isActive: { type: Boolean, default: true },

    // Password lifecycle
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Two-factor authentication (TOTP)
    twoFactor: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, select: false },
      backupCodes: [{ type: String, select: false }],
    },

    // Google OAuth (optional login)
    googleId: { type: String, default: null, index: true, sparse: true },

    lastLoginAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  this.passwordChangedAt = new Date()
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash)
}

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject({ versionKey: false })
  delete obj.passwordHash
  delete obj.passwordResetToken
  delete obj.passwordResetExpires
  if (obj.twoFactor) {
    delete obj.twoFactor.secret
    delete obj.twoFactor.backupCodes
  }
  return obj
}

export const User = mongoose.model('User', userSchema)
