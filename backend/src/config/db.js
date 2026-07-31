import mongoose from 'mongoose'
import { env } from './env.js'
import { logger } from './logger.js'

mongoose.set('strictQuery', true)

export async function connectDB(uri = env.mongoUri) {
  mongoose.connection.on('connected', () => logger.info(`MongoDB connected -> ${mongoose.connection.name}`))
  mongoose.connection.on('error', (err) => logger.error(`MongoDB connection error: ${err.message}`))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'))

  await mongoose.connect(uri, {
    autoIndex: !env.isProd,
  })

  return mongoose.connection
}

export async function disconnectDB() {
  await mongoose.disconnect()
}
