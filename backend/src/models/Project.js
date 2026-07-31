import mongoose from 'mongoose'

// Minimal project record: enough to power CRM "project history" links and
// dashboard widgets (running/completed projects). Full milestone/task/timeline
// management is a later phase.
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'], default: 'not_started' },
    budget: { type: Number, default: 0 },
    deadline: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    assignedTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Project = mongoose.model('Project', projectSchema)
