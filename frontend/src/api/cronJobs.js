import { api } from '../lib/api'

export const cronJobsApi = {
  list: () => api.get('/cron-jobs'),
  update: (id, body) => api.patch(`/cron-jobs/${id}`, body),
  runNow: (id) => api.post(`/cron-jobs/${id}/run`),
}
