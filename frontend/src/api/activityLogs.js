import { api } from '../lib/api'

export const activityLogsApi = {
  list: (params) => api.get('/activity-logs', params),
  recent: () => api.get('/activity-logs/recent'),
}
