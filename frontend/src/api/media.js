import { api } from '../lib/api'

export const mediaApi = {
  list: (params) => api.get('/media', params),
  get: (id) => api.get(`/media/${id}`),
  upload: (file, { folder, tags } = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)
    if (tags) formData.append('tags', tags)
    return api.post('/media', formData)
  },
  remove: (id) => api.del(`/media/${id}`),
}
