import { api } from '../lib/api'

export const pageContentApi = {
  list: () => api.get('/page-content'),
  get: (pageKey) => api.get(`/page-content/${pageKey}`),
  update: (pageKey, body) => api.patch(`/page-content/${pageKey}`, body),
}
