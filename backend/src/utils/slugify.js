import slugify from 'slugify'

export function toSlug(text) {
  return slugify(text, { lower: true, strict: true, trim: true })
}

export async function generateUniqueSlug(Model, text, { excludeId } = {}) {
  const base = toSlug(text)
  let slug = base
  let counter = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug }
    // eslint-disable-next-line no-await-in-loop
    const exists = await Model.exists(filter)
    if (!exists) return slug
    slug = `${base}-${++counter}`
  }
}
