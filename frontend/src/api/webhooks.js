import { api } from '../lib/api'

export const webhooksApi = {
  list: () => api.get('/webhooks'),
  create: (body) => api.post('/webhooks', body),
  update: (id, body) => api.patch(`/webhooks/${id}`, body),
  remove: (id) => api.del(`/webhooks/${id}`),
  test: (id) => api.post(`/webhooks/${id}/test`),
}
