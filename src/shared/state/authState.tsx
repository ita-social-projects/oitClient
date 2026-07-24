import type { ResponseUser } from '@shared/models/user';
import { create } from 'zustand';

export type AuthState = {
  isAuthenticated: boolean;
  user: ResponseUser | null;
  login: (userData: ResponseUser) => void;
  logout: () => void;
};

const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (userData: ResponseUser) => set({ isAuthenticated: true, user: userData }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuth;
