import { api } from '../lib/api'

export const redirectsApi = {
  list: (params) => api.get('/redirects', params),
  get: (id) => api.get(`/redirects/${id}`),
  create: (body) => api.post('/redirects', body),
  update: (id, body) => api.patch(`/redirects/${id}`, body),
  remove: (id) => api.del(`/redirects/${id}`),
}
