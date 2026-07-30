import { axiosInstance } from '@shared/api/axiosInstance';
import type { UserResponse, ChangeUserRoleRequest, UserDto, ChangeUserStatusRequest } from '@shared/models/user';

const API_BASE = import.meta.env.VITE_API_URL;

export const userService = {
  getUsers: async (page: number, size: number, search?: string) => {
    const { data } = await axiosInstance.get<UserResponse>(`${API_BASE}/api/v1/users`, {
      params: {
        page,
        size,
        search,
      },
    });

    return data;
  },

  changeRole: async (id: number, request: ChangeUserRoleRequest) => {
    const { data } = await axiosInstance.patch<UserDto>(`${API_BASE}/api/v1/users/${id}/role`, request);

    return data;
  },

  changeStatus: async (id: number, request: ChangeUserStatusRequest) => {
    const { data } = await axiosInstance.patch<UserDto>(`${API_BASE}/api/v1/users/${id}/status`, request);

    return data;
  },
  
  getProfile: () => axiosInstance.get<UserDto>('/api/v1/users/profile'),
};
