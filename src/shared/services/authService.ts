import axios from 'axios';

const API_BASE = '';

export const authService = {
  createUser: (data: { fullName: string; email: string; password: string }) =>
    axios.post(`${API_BASE}/users`, data),
  login: (data: { email: string; password: string }) => axios.post(`${API_BASE}/login`, data),
};
