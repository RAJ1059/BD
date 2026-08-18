import { api } from '../lib/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const backupsApi = {
  list: () => api.get('/backups'),
  createNow: () => api.post('/backups'),
  downloadUrl: (fileName) => `${API_BASE_URL}/backups/${fileName}/download`,
  restore: (fileName) => api.post(`/backups/${fileName}/restore`),
}
