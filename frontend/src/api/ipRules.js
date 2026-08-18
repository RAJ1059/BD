import { api } from '../lib/api'

export const ipRulesApi = {
  list: () => api.get('/ip-rules'),
  create: (body) => api.post('/ip-rules', body),
  remove: (id) => api.del(`/ip-rules/${id}`),
}
