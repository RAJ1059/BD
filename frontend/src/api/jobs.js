import { api } from '../lib/api'

export const jobsApi = {
  list: (params) => api.get('/jobs', params),
  retry: (id) => api.post(`/jobs/${id}/retry`),
}
