import { api } from '../lib/api'

export const leadsApi = {
  list: (params) => api.get('/leads', params),
  get: (id) => api.get(`/leads/${id}`),
  create: (body) => api.post('/leads', body),
  update: (id, body) => api.patch(`/leads/${id}`, body),
  remove: (id) => api.del(`/leads/${id}`),
  updateStatus: (id, status, lostReason) => api.patch(`/leads/${id}/status`, { status, lostReason }),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
  convert: (id) => api.post(`/leads/${id}/convert`, {}),
}
