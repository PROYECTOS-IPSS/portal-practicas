import { api } from './api';
import type { User } from './types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  major?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: (input: RegisterInput) => api.post<User>('/auth/register', input),
  login: (input: LoginInput) => api.post<User>('/auth/login', input),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  session: () => api.get<User>('/auth/session'),
};
