import { axiosInstance } from '@shared/api/axiosInstance';
import type { AddOwnerRequestDTO, RemoveOwnerRequestDTO, TaskDto, TaskResponse } from '@shared/models/task';

export const taskService = {
  getTasks: async (page: number, size: number, search?: string) => {
    const { data } = await axiosInstance.get<TaskResponse>('/api/v1/tasks', {
      params: {
        page,
        size,
        search,
      },
    });

    return data;
  },

  addOwner: async (id: number, request: AddOwnerRequestDTO) => {
    const { data } = await axiosInstance.patch<TaskDto>(`/api/v1/tasks/${id}/add-owner`, request);

    return data;
  },

  removeOwner: async (id: number, request: RemoveOwnerRequestDTO) => {
    const { data } = await axiosInstance.patch<TaskDto>(`/api/v1/tasks/${id}/remove-owner`, request);

    return data;
  }
};
