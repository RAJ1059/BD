export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export function parseSort(sortParam, allowedFields = [], fallback = '-createdAt') {
  if (!sortParam) return fallback
  const fields = sortParam
    .split(',')
    .map((f) => f.trim())
    .filter((f) => allowedFields.includes(f.replace('-', '')))
  return fields.length ? fields.join(' ') : fallback
}
