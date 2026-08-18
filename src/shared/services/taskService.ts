import { axiosInstance } from '@shared/api/axiosInstance';
import type { FileDto } from '@shared/models/news';
import type {
  CreateTaskRequest,
  TaskFileRole,
  TaskItem,
  TaskListResponse,
  UpdateTaskRequest,
  AddOwnerRequestDTO,
  RemoveOwnerRequestDTO
} from '@shared/models/task';

const API_BASE = import.meta.env.VITE_API_URL;

export const taskService = {
  getTasks: async (page: number, size: number, search?: string) => {
    const { data } = await axiosInstance.get<TaskListResponse>('/api/v1/tasks', {
      params: {
        page,
        size,
        search,
      },
    });

    return data;
  },

  getMyTasks: async (page: number, size: number, sort = 'createdAt,ASC') => {
    const { data } = await axiosInstance.get<TaskListResponse>(`${API_BASE}/api/v1/tasks/my`, {
      params: { page, size, sort },
    });
    return data;
  },

  getTaskById: async (id: number) => {
    const { data } = await axiosInstance.get<TaskItem>(`${API_BASE}/api/v1/tasks/${id}`);
    return data;
  },

  createTask: (data: CreateTaskRequest) => axiosInstance.post(`${API_BASE}/api/v1/tasks`, data),

  updateTask: (id: number, data: UpdateTaskRequest) =>
    axiosInstance.put(`${API_BASE}/api/v1/tasks/${id}`, data),

  deleteTask: (id: number) => axiosInstance.delete(`${API_BASE}/api/v1/tasks/${id}`),

  uploadFiles: (files: File[], fileRole: TaskFileRole) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append(
      'metadata',
      new Blob(
        [
          JSON.stringify({
            relatedEntityType: 'TASK',
            relatedEntityId: null,
            fileRole,
          }),
        ],
        { type: 'application/json' },
      ),
    );
    return axiosInstance.post<FileDto[]>(`${API_BASE}/api/v1/files`, formData);
  },
  updateFileRole: async (fileId: number, newRole: TaskFileRole): Promise<void> => {
    await axiosInstance.patch(`/api/v1/files/${fileId}/role`, null, {
      params: { newRole },
    });
  },
  addOwner: async (id: number, request: AddOwnerRequestDTO) => {
    const { data } = await axiosInstance.patch<TaskItem>(`/api/v1/tasks/${id}/add-owner`, request);

    return data;
  },

  removeOwner: async (id: number, request: RemoveOwnerRequestDTO) => {
    const { data } = await axiosInstance.patch<TaskItem>(`/api/v1/tasks/${id}/remove-owner`, request);

    return data;
  },
};

