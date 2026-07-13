import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const authService = {
  createUser: (data: { fullName: string; email: string; password: string }) =>
    axios.post(`${API_BASE}/users`, data),
  login: (data: { username: string; password: string }) => axios.post(`${API_BASE}/security/signIn`, data),
};
