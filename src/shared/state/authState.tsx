import { create } from 'zustand';

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

const useAuth = create<AuthState>(set => ({
  isAuthenticated: false,
  user: null,
  login: (userData: User) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export default useAuth;
