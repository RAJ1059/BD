import { connectDB, disconnectDB } from '../config/db.js'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'
import { Role } from '../models/Role.js'
import { User } from '../models/User.js'
import { PageContent } from '../models/PageContent.js'
import { Service } from '../models/Service.js'
import { Page } from '../models/Page.js'
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, ROLE_NAMES } from '../config/constants.js'
import { PAGE_CONTENT_SEED, SERVICE_SEED, LEGAL_PAGE_SEED } from './pageContentSeedData.js'

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

  logger.info('Seeding page content...')
  for (const [pageKey, sections] of Object.entries(PAGE_CONTENT_SEED)) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await PageContent.findOne({ pageKey })
    if (existing) {
      logger.info(`  Page content "${pageKey}" already exists, skipping`)
    } else {
      // eslint-disable-next-line no-await-in-loop
      await PageContent.create({ pageKey, sections })
      logger.info(`  ✓ Page content created: ${pageKey}`)
    }
  }

  logger.info('Seeding services...')
  for (const service of SERVICE_SEED) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await Service.findOne({ slug: service.slug })
    if (existing) {
      logger.info(`  Service "${service.slug}" already exists, skipping`)
    } else {
      // eslint-disable-next-line no-await-in-loop
      await Service.create({ ...service, order: SERVICE_SEED.indexOf(service) })
      logger.info(`  ✓ Service created: ${service.slug}`)
    }
  }

  logger.info('Seeding legal pages...')
  for (const legalPage of LEGAL_PAGE_SEED) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await Page.findOne({ slug: legalPage.slug })
    if (existing) {
      logger.info(`  Page "${legalPage.slug}" already exists, skipping`)
    } else {
      // eslint-disable-next-line no-await-in-loop
      await Page.create({
        title: legalPage.title,
        slug: legalPage.slug,
        content: legalPage.content,
        status: 'published',
        publishedAt: new Date(),
        revisions: [{ title: legalPage.title, content: legalPage.content }],
      })
      logger.info(`  ✓ Page created: ${legalPage.slug}`)
    }
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
