import { api } from '../lib/api'

export const menusApi = {
  list: (params) => api.get('/menus', params),
  get: (id) => api.get(`/menus/${id}`),
  create: (body) => api.post('/menus', body),
  update: (id, body) => api.patch(`/menus/${id}`, body),
  remove: (id) => api.del(`/menus/${id}`),
}
