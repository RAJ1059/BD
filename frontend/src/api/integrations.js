import { api } from '../lib/api'

export const integrationsApi = {
  list: () => api.get('/integrations'),
  get: (provider) => api.get(`/integrations/${provider}`),
  connect: (provider, credentials) => api.put(`/integrations/${provider}`, credentials),
  disconnect: (provider) => api.put(`/integrations/${provider}/disconnect`),
  test: (provider) => api.post(`/integrations/${provider}/test`),
}
