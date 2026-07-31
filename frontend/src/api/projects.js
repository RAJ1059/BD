import { api } from '../lib/api'

export const projectsApi = {
  list: (params) => api.get('/projects', params),
  get: (id) => api.get(`/projects/${id}`),
  create: (body) => api.post('/projects', body),
  update: (id, body) => api.patch(`/projects/${id}`, body),
  remove: (id) => api.del(`/projects/${id}`),
}
