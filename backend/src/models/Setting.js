import mongoose from 'mongoose'

const smtpSchema = new mongoose.Schema(
  {
    host: { type: String, default: '' },
    port: { type: Number, default: null },
    secure: { type: Boolean, default: false },
    user: { type: String, default: '' },
    pass: { type: String, default: '' },
    from: { type: String, default: '' },
  },
  { _id: false }
)

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Business Direction' },
    logo: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    favicon: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    // Admin-editable override layered on top of .env defaults. Not yet wired
    // into services/email.service.js — that still reads env.mail directly.
    // TODO: once ready, have email.service.js prefer these values (when set)
    // over env.mail.{host,port,secure,user,pass,from}.
    smtp: { type: smtpSchema, default: () => ({}) },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "We'll be back shortly." },
    robotsTxt: { type: String, default: 'User-agent: *\nAllow: /\n' },
  },
  { timestamps: true }
)

// Singleton accessor: always targets the first document, creating a default
// one on first use. Safe under a race (duplicate creates are extremely
// unlikely for a settings doc and simply resolve to "use the first found").
settingSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne()
  if (!doc) {
    try {
      doc = await this.create({})
    } catch {
      doc = await this.findOne()
    }
  }
  return doc
}

export const Setting = mongoose.model('Setting', settingSchema)
