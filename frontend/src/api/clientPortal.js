import { api } from '../lib/api'

export const clientPortalApi = {
  summary: () => api.get('/client-portal/summary'),
  profile: () => api.get('/client-portal/profile'),
  projects: (params) => api.get('/client-portal/projects', params),
}
