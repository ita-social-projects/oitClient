import type { RegisterPayload } from '@shared/models/auth';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const authService = {
  register: (data: RegisterPayload) => axios.post(`${API_BASE}/api/v1/registration`, data),
  resendVerification: (email: string) => axios.post(`${API_BASE}/api/v1/user-activation/resend`, { email }),
  verifyEmail: (token: string) => axios.get(`${API_BASE}/api/v1/user-activation/verify`, { params: { token } }),
  login: (data: { email: string; password: string }) => axios.post(`${API_BASE}/login`, data),
};
