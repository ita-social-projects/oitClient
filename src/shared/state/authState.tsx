import type { UserDto } from '@shared/models/user';
import { forumKeys } from '@shared/query/forumKeys';
import { queryClient } from '@shared/query/queryClient';
import { create } from 'zustand';

export type AuthState = {
  isAuthenticated: boolean;
  user: UserDto | null;
  login: (userData: UserDto) => void;
  logout: () => void;
};

const useAuth = create<AuthState>(set => ({
  isAuthenticated: false,
  user: null,
  login: (userData: UserDto) => set({ isAuthenticated: true, user: userData }),
  logout: () => {
    queryClient.removeQueries({
      queryKey: forumKeys.all,
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuth;
