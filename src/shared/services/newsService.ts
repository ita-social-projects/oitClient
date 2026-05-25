import type { NewsDto } from '@shared/models/news';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const newsService = {
  createNews: (data: NewsDto) => axios.post(`${API_BASE}/api/v1/news`, data),
  saveImages: (images: File[]) => {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    return axios.post(`${API_BASE}/images`, formData);
  },
};
