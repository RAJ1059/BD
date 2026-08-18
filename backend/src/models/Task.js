import mongoose from 'mongoose'
import { TASK_STATUSES, TASK_PRIORITIES } from '../config/constants.js'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo', index: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    relatedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },

    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

taskSchema.index({ assignedTo: 1, status: 1 })

export const Task = mongoose.model('Task', taskSchema)
