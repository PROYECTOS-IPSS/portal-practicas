import { api } from './api';
import type { Student, Teacher } from './types';

export const teachersApi = {
  list: () => api.get<Teacher[]>('/teachers'),
};

export const studentsApi = {
  list: () => api.get<Student[]>('/students'),
};
