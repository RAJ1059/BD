import { api } from '../lib/api'

export const scriptsApi = {
  list: (params) => api.get('/scripts', params),
  get: (id) => api.get(`/scripts/${id}`),
  create: (body) => api.post('/scripts', body),
  update: (id, body) => api.patch(`/scripts/${id}`, body),
  remove: (id) => api.del(`/scripts/${id}`),
  toggle: (id) => api.patch(`/scripts/${id}/toggle`, {}),
}
