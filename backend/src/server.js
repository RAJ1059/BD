import { createApp } from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'

async function main() {
  await connectDB()

  const app = createApp()
  const server = app.listen(env.port, () => {
    logger.info(`${env.appName} API listening on http://localhost:${env.port}`)
    logger.info(`Swagger docs: http://localhost:${env.port}/api/docs`)
  })

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`)
    server.close(() => process.exit(0))
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err)
  process.exit(1)
})
