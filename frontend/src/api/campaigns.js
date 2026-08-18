import { api } from '../lib/api'

export const campaignsApi = {
  list: (params) => api.get('/campaigns', params),
  get: (id) => api.get(`/campaigns/${id}`),
  analytics: (id) => api.get(`/campaigns/${id}/analytics`),
  create: (body) => api.post('/campaigns', body),
  update: (id, body) => api.patch(`/campaigns/${id}`, body),
  remove: (id) => api.del(`/campaigns/${id}`),
}
