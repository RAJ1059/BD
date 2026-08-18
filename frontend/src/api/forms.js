import { api } from '../lib/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const formsApi = {
  list: (params) => api.get('/forms', params),
  get: (id) => api.get(`/forms/${id}`),
  create: (body) => api.post('/forms', body),
  update: (id, body) => api.patch(`/forms/${id}`, body),
  remove: (id) => api.del(`/forms/${id}`),
  submissions: (id, params) => api.get(`/forms/${id}/submissions`, params),
  exportSubmissionsUrl: (id) => `${API_BASE_URL}/forms/${id}/submissions/export`,
  deleteSubmission: (id, submissionId) => api.del(`/forms/${id}/submissions/${submissionId}`),
}
