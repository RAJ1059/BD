import { api } from '../lib/api'

export const logsApi = {
  errors: (params) => api.get('/logs/errors', params),
}
