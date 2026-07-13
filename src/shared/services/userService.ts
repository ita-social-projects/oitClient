import type { UserResponse, ChangeUserRoleRequest, UserDto } from '@shared/models/user';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const userService = {
  getUsers: async (page: number, size: number, search?: string) => {
    const { data } = await axios.get<UserResponse>(`${API_BASE}/users`, {
      params: {
        page,
        size,
        search,
      },
    });

    return data;
  },

  changeRole: async (id: number, request: ChangeUserRoleRequest) => {
    const { data } = await axios.patch<UserDto>(`${API_BASE}/users/${id}/role`, request);

    return data;
  },
};
