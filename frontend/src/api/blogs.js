import { api } from '../lib/api'

export const blogsApi = {
  list: (params) => api.get('/blogs', params),
  get: (id) => api.get(`/blogs/${id}`),
  create: (body) => api.post('/blogs', body),
  update: (id, body) => api.patch(`/blogs/${id}`, body),
  remove: (id) => api.del(`/blogs/${id}`),
  publish: (id) => api.post(`/blogs/${id}/publish`, {}),
  revisions: (id) => api.get(`/blogs/${id}/revisions`),
  moderateComment: (id, commentId, approved) => api.patch(`/blogs/${id}/comments/${commentId}`, { approved }),
  analyticsSummary: () => api.get('/blogs/analytics/summary'),
}
