import { api } from '../lib/api'

export const pagesApi = {
  list: (params) => api.get('/pages', params),
  get: (id) => api.get(`/pages/${id}`),
  create: (body) => api.post('/pages', body),
  update: (id, body) => api.patch(`/pages/${id}`, body),
  remove: (id) => api.del(`/pages/${id}`),
  publish: (id) => api.post(`/pages/${id}/publish`, {}),
  revisions: (id) => api.get(`/pages/${id}/revisions`),
}
