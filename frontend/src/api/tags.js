import { api } from '../lib/api'

export const tagsApi = {
  list: () => api.get('/tags'),
  create: (body) => api.post('/tags', body),
  update: (id, body) => api.patch(`/tags/${id}`, body),
  remove: (id) => api.del(`/tags/${id}`),
}
