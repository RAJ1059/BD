import { api } from '../lib/api'

export const apiKeysApi = {
  list: () => api.get('/api-keys'),
  create: (body) => api.post('/api-keys', body),
  revoke: (id) => api.patch(`/api-keys/${id}/revoke`),
  remove: (id) => api.del(`/api-keys/${id}`),
}
