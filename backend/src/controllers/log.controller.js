import fs from 'node:fs/promises'
import path from 'node:path'
import { catchAsync } from '../utils/catchAsync.js'
import { ok } from '../utils/ApiResponse.js'

const ERROR_LOG_PATH = path.resolve(process.cwd(), 'logs', 'error.log')

export const getErrorLogs = catchAsync(async (req, res) => {
  const lines = Math.max(1, Number.parseInt(req.query.lines, 10) || 100)

  let content = ''
  try {
    content = await fs.readFile(ERROR_LOG_PATH, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') return ok(res, [], 'Error logs')
    throw err
  }

  const allLines = content.split('\n').filter(Boolean)
  return ok(res, allLines.slice(-lines), 'Error logs')
})
