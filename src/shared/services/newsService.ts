import type { CreateNewsRequest, UpdateNewsRequest, NewsDetailItem, FileDto } from '@shared/models/news';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const newsService = {
  createNews: (data: CreateNewsRequest) => axios.post(`${API_BASE}/api/v1/news`, data),
  updateNews: (data: UpdateNewsRequest) => axios.put(`${API_BASE}/api/v1/news`, data),
  deleteNews: (id: number) => axios.delete(`${API_BASE}/api/v1/news/${id}`),
  getNewsById: async (id: number) => {
    const { data } = await axios.get<NewsDetailItem>(`${API_BASE}/api/v1/news/${id}`);
    return data;
  },
  getFilesByNewsId: async (newsId: number) => {
    return axios.get<FileDto[]>(`${API_BASE}/api/v1/files`, {
      params: { entityType: 'NEWS', entityId: newsId }
    });
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append(
      'metadata',
      new Blob(
        [JSON.stringify({ relatedEntityType: 'NEWS', relatedEntityId: null })],
        { type: 'application/json' }
      )
    );
    return axios.post<FileDto[]>(`${API_BASE}/api/v1/files`, formData);
  },
};
