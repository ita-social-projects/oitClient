import type { NewsDto } from '@shared/models/news';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const newsService = {
  createNews: (data: NewsDto) => axios.post(`${API_BASE}/api/v1/news`, data),
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
    return axios.post<{ url: string }[]>(`${API_BASE}/api/v1/files`, formData);
  },
};
