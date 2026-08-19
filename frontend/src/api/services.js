import { api } from '../lib/api'

export const servicesApi = {
  list: () => api.get('/services'),
  get: (id) => api.get(`/services/${id}`),
  create: (body) => api.post('/services', body),
  update: (id, body) => api.patch(`/services/${id}`, body),
  remove: (id) => api.del(`/services/${id}`),
  reorder: (order) => api.patch('/services/reorder', { order }),
}
