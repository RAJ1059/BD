import sharp from 'sharp'

const MAX_DIMENSION = 2000
const THUMBNAIL_WIDTH = 400

/**
 * Optimizes an uploaded image: caps its largest dimension, re-encodes to
 * a web-friendly format, and produces a lightweight thumbnail buffer.
 */
export async function optimizeImage(buffer, { mimeType }) {
  const image = sharp(buffer, { failOn: 'none' })
  const metadata = await image.metadata()

  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  })

  const optimized = mimeType === 'image/png' ? await resized.png({ quality: 82 }).toBuffer() : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer()

  const thumbnail = await sharp(buffer).resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true }).jpeg({ quality: 70 }).toBuffer()

  return {
    buffer: optimized,
    thumbnail,
    width: Math.min(metadata.width || 0, MAX_DIMENSION),
    height: metadata.height ? Math.round((Math.min(metadata.width || 0, MAX_DIMENSION) / metadata.width) * metadata.height) : 0,
  }
}

export function isOptimizableImage(mimeType) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)
}
