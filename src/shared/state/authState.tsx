import type { UserDto } from '@shared/models/user';
import { create } from 'zustand';

export type AuthState = {
  isAuthenticated: boolean;
  user: UserDto | null;
  login: (userData: UserDto) => void;
  logout: () => void;
};

const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (userData: UserDto) => set({ isAuthenticated: true, user: userData }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuth;
