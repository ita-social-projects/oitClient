import type { ResponseUser } from '@shared/models/user';
import { axiosInstance } from '@shared/api/axiosInstance';

export const userService = {
    getProfile: () => axiosInstance.get<ResponseUser>(`/api/v1/users/profile`),
};
