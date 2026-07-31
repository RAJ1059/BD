import fs from 'node:fs/promises'
import path from 'node:path'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const LOCAL_ROOT = path.resolve(process.cwd(), env.storage.localDir)

let s3Client = null
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: env.storage.aws.region,
      credentials: {
        accessKeyId: env.storage.aws.accessKeyId,
        secretAccessKey: env.storage.aws.secretAccessKey,
      },
    })
  }
  return s3Client
}

let cloudinaryConfigured = false
function getCloudinary() {
  if (!cloudinaryConfigured) {
    const { cloudName, apiKey, apiSecret, url } = env.storage.cloudinary
    if (url) {
      cloudinary.config({ cloudinary_url: url })
    } else {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
    }
    cloudinaryConfigured = true
  }
  return cloudinary
}

function cloudinaryUpload(buffer, { key, resourceType = 'image' }) {
  // Cloudinary appends the detected format to the delivery URL itself for
  // image/video uploads, so the extension must be stripped from public_id
  // here or URLs end up double-suffixed (e.g. "thumb.jpg.jpg").
  const publicId = resourceType === 'raw' ? key : key.replace(/\.[a-z0-9]+$/i, '')

  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { public_id: publicId, folder: env.storage.cloudinary.folder, resource_type: resourceType, overwrite: true },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    stream.end(buffer)
  })
}

/**
 * Storage abstraction so controllers never know whether a file lives on
 * disk or in S3. Switch STORAGE_DRIVER=s3 in .env (with AWS_* credentials)
 * and every upload flows through S3 with no controller changes.
 */
export const storageService = {
  driver: env.storage.driver,

  async save(buffer, { key, mimeType }) {
    if (env.storage.driver === 'cloudinary') {
      if (!env.storage.cloudinary.url && !env.storage.cloudinary.cloudName) {
        logger.warn('[storage] STORAGE_DRIVER=cloudinary but no Cloudinary credentials are set; falling back to local storage')
        return localSave(buffer, key)
      }
      const resourceType = mimeType?.startsWith('video/') ? 'video' : mimeType?.startsWith('image/') ? 'image' : 'raw'
      const result = await cloudinaryUpload(buffer, { key, resourceType })
      return {
        storageDriver: 'cloudinary',
        storageKey: result.public_id,
        url: result.secure_url,
      }
    }

    if (env.storage.driver === 's3') {
      if (!env.storage.aws.bucket) {
        logger.warn('[storage] STORAGE_DRIVER=s3 but AWS_S3_BUCKET is not set; falling back to local storage')
        return localSave(buffer, key)
      }
      await getS3Client().send(
        new PutObjectCommand({
          Bucket: env.storage.aws.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      )
      return {
        storageDriver: 's3',
        storageKey: key,
        url: `https://${env.storage.aws.bucket}.s3.${env.storage.aws.region}.amazonaws.com/${key}`,
      }
    }
    return localSave(buffer, key)
  },

  async remove({ storageDriver, storageKey }) {
    if (storageDriver === 'cloudinary') {
      await getCloudinary().uploader.destroy(storageKey, { resource_type: 'image' }).catch(() => {})
      return
    }
    if (storageDriver === 's3') {
      if (!env.storage.aws.bucket) return
      await getS3Client().send(new DeleteObjectCommand({ Bucket: env.storage.aws.bucket, Key: storageKey }))
      return
    }
    const fullPath = path.join(LOCAL_ROOT, storageKey)
    await fs.rm(fullPath, { force: true })
  },
}

async function localSave(buffer, key) {
  const fullPath = path.join(LOCAL_ROOT, key)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, buffer)
  return {
    storageDriver: 'local',
    storageKey: key,
    url: `${env.apiBaseUrl}/uploads/${key.split(path.sep).join('/')}`,
  }
}
