import { api } from '../lib/api'

export const rolesApi = {
  list: () => api.get('/roles'),
  get: (id) => api.get(`/roles/${id}`),
  create: (body) => api.post('/roles', body),
  update: (id, body) => api.patch(`/roles/${id}`, body),
  remove: (id) => api.del(`/roles/${id}`),
  permissionCatalog: () => api.get('/roles/permissions/catalog'),
}
