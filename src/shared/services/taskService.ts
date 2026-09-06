import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  CreateTaskRequest,
  TaskDTO,
  TaskListResponse,
  UpdateTaskRequest,
  AddOwnerRequestDTO,
  RemoveOwnerRequestDTO,
  LinkedTour,
  PendingFile,
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

  getMyTasks: async (page: number, size: number, search?: string, sort = 'createdAt,ASC') => {
    const { data } = await axiosInstance.get<TaskListResponse>(`${API_BASE}/api/v1/tasks/my`, {
      params: { page, size, sort, search },
    });
    return data;
  },

  getTaskById: async (id: number) => {
    const { data } = await axiosInstance.get<TaskDTO>(`${API_BASE}/api/v1/tasks/${id}`);
    return data;
  },

  createTask: (metadata: CreateTaskRequest, pendingFiles: PendingFile[]) => {
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

    for (const pf of pendingFiles) {
      const partName = `${pf.role!.toLowerCase()}Files`; // problemFiles | referenceFiles | solutionFiles
      formData.append(partName, pf.file);
    }

    return axiosInstance.post<TaskDTO>(`${API_BASE}/api/v1/tasks`, formData);
  },

  updateTask: (id: number, metadata: UpdateTaskRequest, pendingFiles: PendingFile[]) => {
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

    for (const pf of pendingFiles) {
      const partName = `${pf.role!.toLowerCase()}Files`;
      formData.append(partName, pf.file);
    }

    return axiosInstance.put<TaskDTO>(`${API_BASE}/api/v1/tasks/${id}`, formData);
  },

  deleteTask: (id: number) => axiosInstance.delete(`${API_BASE}/api/v1/tasks/${id}`),

  addOwner: async (id: number, request: AddOwnerRequestDTO) => {
    const { data } = await axiosInstance.patch<TaskDTO>(`/api/v1/tasks/${id}/add-owner`, request);

    return data;
  },

  removeOwner: async (id: number, request: RemoveOwnerRequestDTO) => {
    const { data } = await axiosInstance.patch<TaskDTO>(
      `/api/v1/tasks/${id}/remove-owner`,
      request,
    );

    return data;
  },

  getLinkedTours: async (taskId: number): Promise<LinkedTour[]> => {
    const { data } = await axiosInstance.get<LinkedTour[]>(`/api/v1/tasks/${taskId}/linked-tours`);
    return data;
  },
};

