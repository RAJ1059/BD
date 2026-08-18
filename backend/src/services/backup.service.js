import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { EJSON } from 'bson'

// `bson` ships as a transitive dependency of mongoose, and its EJSON codec
// round-trips ObjectId/Date fields correctly (unlike plain JSON.stringify).
const BACKUP_DIR = path.resolve(process.cwd(), 'backups')

async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true })
}

export async function createBackup() {
  await ensureBackupDir()

  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()

  const dump = {}
  for (const { name } of collections) {
    dump[name] = await db.collection(name).find({}).toArray()
  }

  const fileName = `backup-${Date.now()}.json`
  const filePath = path.join(BACKUP_DIR, fileName)
  const contents = EJSON.stringify(dump, null, 2)
  await fs.writeFile(filePath, contents, 'utf8')

  const stat = await fs.stat(filePath)
  return { fileName, path: filePath, collectionsCount: collections.length, sizeBytes: stat.size }
}

// DESTRUCTIVE: for every collection present in the backup file, this wipes
// all existing documents (deleteMany({})) before re-inserting the backed up
// documents. Only call this behind a Super Admin gate.
export async function restoreBackup(fileName) {
  const filePath = path.join(BACKUP_DIR, path.basename(fileName))
  const raw = await fs.readFile(filePath, 'utf8')
  const dump = EJSON.parse(raw)

  const db = mongoose.connection.db
  const restored = []
  for (const [name, docs] of Object.entries(dump)) {
    const collection = db.collection(name)
    await collection.deleteMany({})
    if (Array.isArray(docs) && docs.length) {
      await collection.insertMany(docs)
    }
    restored.push({ collection: name, count: Array.isArray(docs) ? docs.length : 0 })
  }

  return { fileName, restored }
}

export async function listBackups() {
  await ensureBackupDir()
  const files = await fs.readdir(BACKUP_DIR)
  const backups = await Promise.all(
    files
      .filter((f) => f.endsWith('.json'))
      .map(async (fileName) => {
        const stat = await fs.stat(path.join(BACKUP_DIR, fileName))
        return { fileName, sizeBytes: stat.size, createdAt: stat.birthtime }
      })
  )
  return backups.sort((a, b) => b.createdAt - a.createdAt)
}

export { BACKUP_DIR }
