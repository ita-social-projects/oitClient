import { axiosInstance } from '@shared/api/axiosInstance';
import type { CreateNewsRequest, UpdateNewsRequest, NewsDetailItem, FileDto, NewsAdminResponse, NewsStatus } from '@shared/models/news';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const newsService = {
  createNews: (data: CreateNewsRequest) => axiosInstance.post(`${API_BASE}/api/v1/news`, data),
  updateNews: (data: UpdateNewsRequest) => axiosInstance.put(`${API_BASE}/api/v1/news`, data),
  deleteNews: (id: number) => axiosInstance.delete(`${API_BASE}/api/v1/news/${id}`),
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
    return axiosInstance.post<FileDto[]>(`${API_BASE}/api/v1/files`, formData);
  },
  getAllNewsForAdmin: async (page: number, size: number, search?: string, statuses?: NewsStatus[],
    dateFrom?: string, dateTo?: string) => {
    const { data } = await axiosInstance.get<NewsAdminResponse>(`${API_BASE}/api/v1/news/admin`, {
      params: {
        page,
        size,
        search: search || undefined,
        statuses: statuses?.length ? statuses : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
    return data;
  }
};
