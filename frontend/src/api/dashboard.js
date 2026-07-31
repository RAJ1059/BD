import { api } from '../lib/api'

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  charts: (months) => api.get('/dashboard/charts', months ? { months } : undefined),
  teamOverview: () => api.get('/dashboard/team-overview'),
}
