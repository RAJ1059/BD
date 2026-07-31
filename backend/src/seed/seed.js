import { connectDB, disconnectDB } from '../config/db.js'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'
import { Role } from '../models/Role.js'
import { User } from '../models/User.js'
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, ROLE_NAMES } from '../config/constants.js'

function toPermissionArray(moduleActionMap) {
  return PERMISSION_MODULES.filter((mod) => moduleActionMap[mod]?.length).map((mod) => ({ module: mod, actions: moduleActionMap[mod] }))
}

export async function seed() {
  await connectDB()
  logger.info('Seeding roles...')

  const superAdminRole = await Role.findOneAndUpdate(
    { name: ROLE_NAMES.SUPER_ADMIN },
    { name: ROLE_NAMES.SUPER_ADMIN, description: 'Full, unrestricted access to every module', isSystem: true, permissions: [] },
    { upsert: true, new: true }
  )

  for (const [roleName, moduleActionMap] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    // eslint-disable-next-line no-await-in-loop
    await Role.findOneAndUpdate(
      { name: roleName },
      { name: roleName, isSystem: true, permissions: toPermissionArray(moduleActionMap) },
      { upsert: true, new: true }
    )
    logger.info(`  ✓ ${roleName}`)
  }

  logger.info('Seeding Super Admin user...')
  const existingSuperAdmin = await User.findOne({ email: env.seedSuperAdmin.email })
  if (existingSuperAdmin) {
    logger.info(`  Super Admin already exists (${env.seedSuperAdmin.email}), skipping`)
  } else {
    await User.create({
      name: env.seedSuperAdmin.name,
      email: env.seedSuperAdmin.email,
      passwordHash: env.seedSuperAdmin.password,
      role: superAdminRole._id,
      isActive: true,
    })
    logger.info(`  ✓ Super Admin created: ${env.seedSuperAdmin.email}`)
  }

  logger.info('Seed complete.')
}

const isMain = process.argv[1] && process.argv[1].endsWith('seed.js')
if (isMain) {
  seed()
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Seed failed: ${err.message}`)
      process.exit(1)
    })
}
