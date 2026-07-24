import { axiosInstance } from '@shared/api/axiosInstance';
import type { ResponseUser } from '@shared/models/user';

export const userService = {
    getProfile: () => axiosInstance.get<ResponseUser>('/api/v1/users/profile'),
};
