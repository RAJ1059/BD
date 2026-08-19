import { api } from '../lib/api'

export const integrationsApi = {
  list: () => api.get('/integrations'),
  get: (provider) => api.get(`/integrations/${provider}`),
  connect: (provider, credentials) => api.put(`/integrations/${provider}`, credentials),
  disconnect: (provider) => api.put(`/integrations/${provider}/disconnect`),
  test: (provider) => api.post(`/integrations/${provider}/test`),
  getOAuthUrl: (provider) => api.get(`/integrations/${provider}/oauth/url`),
  updateSite: (provider, siteUrl) => api.patch(`/integrations/${provider}/site`, { siteUrl }),
}
