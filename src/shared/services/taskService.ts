import { axiosInstance } from '@shared/api/axiosInstance';
import type { TaskListResponse } from '@shared/models/task';

const API_BASE = import.meta.env.VITE_API_URL;

export const taskService = {
  getMyTasks: async (page: number, size: number, sort = 'createdAt,ASC') => {
    const { data } = await axiosInstance.get<TaskListResponse>(`${API_BASE}/api/v1/tasks/my`, {
      params: { page, size, sort },
    });
    return data;
  },
};
