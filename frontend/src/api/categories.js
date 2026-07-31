import { api } from '../lib/api'

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (body) => api.post('/categories', body),
  update: (id, body) => api.patch(`/categories/${id}`, body),
  remove: (id) => api.del(`/categories/${id}`),
}
