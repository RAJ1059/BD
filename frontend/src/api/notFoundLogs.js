import { api } from '../lib/api'

export const notFoundLogsApi = {
  list: (params) => api.get('/not-found-logs', params),
  remove: (id) => api.del(`/not-found-logs/${id}`),
}
