import path from 'node:path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import swaggerUi from 'swagger-ui-express'

import { env } from './config/env.js'
import { logger } from './config/logger.js'
import apiRoutes from './routes/index.js'
import { swaggerSpec } from './docs/swagger.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'
import { generalLimiter } from './middlewares/rateLimiter.js'
import { ipFilter } from './middlewares/ipFilter.js'
import { maintenanceModeGate } from './middlewares/maintenanceMode.js'
import { sitemapXml, rssXml, robotsTxt } from './controllers/public.controller.js'

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)

  // --- Security -------------------------------------------------------
  app.use(helmet())
  app.use(
    cors({
      origin: [env.clientUrl, env.adminClientUrl],
      credentials: true,
    })
  )
  app.use(ipFilter)
  app.use(hpp())
  app.use(mongoSanitize())

  // --- Parsing ---------------------------------------------------------
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser(env.cookieSecret))
  app.use(compression())

  // --- Logging -----------------------------------------------------------
  app.use(morgan(env.isProd ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }))

  // --- Rate limiting (skip in test to avoid flaky CI) --------------------
  app.use('/api', generalLimiter)

  // --- Static uploads (only relevant when STORAGE_DRIVER=local) ----------
  app.use('/uploads', express.static(path.resolve(process.cwd(), env.storage.localDir)))

  // --- SEO feeds consumed by the public website ---------------------------
  app.get('/sitemap.xml', sitemapXml)
  app.get('/rss.xml', rssXml)
  app.get('/robots.txt', robotsTxt)

  // --- Health check --------------------------------------------------------
  app.get('/health', (_req, res) => res.json({ success: true, message: 'OK', uptime: process.uptime() }))

  // --- API docs --------------------------------------------------------------
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec))

  // --- Maintenance mode gate for the public website reads only -----------
  app.use('/api/public', maintenanceModeGate)

  // --- API routes ---------------------------------------------------------
  app.use('/api', apiRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
