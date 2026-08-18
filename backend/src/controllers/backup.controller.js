import path from 'node:path'
import { catchAsync } from '../utils/catchAsync.js'
import { ApiError } from '../utils/ApiError.js'
import { ok, created } from '../utils/ApiResponse.js'
import { createBackup, restoreBackup, listBackups, BACKUP_DIR } from '../services/backup.service.js'
import { recordActivity } from '../services/activityLog.service.js'

export const createBackupNow = catchAsync(async (req, res) => {
  const result = await createBackup()

  await recordActivity(req, { action: 'create', module: 'settings', description: `Created DB backup "${result.fileName}"` })
  return created(res, result, 'Backup created')
})

export const listBackupFiles = catchAsync(async (_req, res) => {
  const backups = await listBackups()
  return ok(res, backups, 'Backups')
})

// Maximally destructive — gated with requireSuperAdmin at the route level in
// addition to the settings/edit permission check.
export const restoreFromBackup = catchAsync(async (req, res) => {
  const result = await restoreBackup(req.params.fileName)

  await recordActivity(req, { action: 'update', module: 'settings', description: `Restored DB from backup "${req.params.fileName}"` })
  return ok(res, result, 'Backup restored')
})

export const downloadBackup = catchAsync(async (req, res) => {
  const fileName = path.basename(req.params.fileName)
  const filePath = path.join(BACKUP_DIR, fileName)

  res.download(filePath, fileName, (err) => {
    if (err) throw ApiError.notFound('Backup file not found')
  })
})
