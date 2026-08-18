import { api } from '../lib/api'

export const tasksApi = {
  list: (params) => api.get('/tasks', params),
  get: (id) => api.get(`/tasks/${id}`),
  create: (body) => api.post('/tasks', body),
  update: (id, body) => api.patch(`/tasks/${id}`, body),
  remove: (id) => api.del(`/tasks/${id}`),
}
