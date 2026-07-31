import { api } from '../lib/api'

export const clientsApi = {
  list: (params) => api.get('/clients', params),
  get: (id) => api.get(`/clients/${id}`),
  create: (body) => api.post('/clients', body),
  update: (id, body) => api.patch(`/clients/${id}`, body),
  remove: (id) => api.del(`/clients/${id}`),
  attach: (id, mediaId, opts) => api.post(`/clients/${id}/attachments`, { mediaId, ...opts }),
}
