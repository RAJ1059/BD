import { api } from '../lib/api'

export const socialApi = {
  list: () => api.get('/social'),
  analytics: () => api.get('/social/analytics'),
  upsert: (platform, body) => api.put(`/social/${platform}`, body),
  remove: (platform) => api.del(`/social/${platform}`),
}
