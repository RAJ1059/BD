import { api } from '../lib/api'

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (body) => api.patch('/settings', body),
}
