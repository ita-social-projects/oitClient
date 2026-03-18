import type { NewsDto } from '@shared/models/news';
import axios from 'axios';
import { environments } from '../../environments';

const API_BASE = environments.apiBaseUrl;

export const newsService = {
  createNews: (data: NewsDto) => axios.post(`${API_BASE}/news`, data),
  saveImages: (images: File[]) => {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    return axios.post(`${API_BASE}/images`, formData);
  },
};
