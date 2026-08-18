const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

let currentAccessToken = null

export function setAccessToken(token) {
  currentAccessToken = token
}

async function request(path, { method = 'GET', body, params, token } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
    })
  }

  const authToken = token ?? currentAccessToken
  const isFormData = body instanceof FormData

  let res
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      headers: {
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.', 0)
  }

  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || 'Something went wrong. Please try again.', res.status, json.details)
  }

  return json
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body, ...opts }),
  del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
}
