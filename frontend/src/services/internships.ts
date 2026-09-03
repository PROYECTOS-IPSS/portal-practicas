import { api } from './api';
import type { Internship, InternshipList, InternshipStatus } from './types';

export interface CreateInternshipInput {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  bossName: string;
  bossContact: string;
  startDate: string;
  endDate: string;
  description: string;
  teacherId: string;
  studentId?: string;
}

export interface UpdateInternshipInput {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  bossName?: string;
  bossContact?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  teacherId?: string;
  status?: InternshipStatus;
}

export interface InternshipQuery {
  page?: number;
  pageSize?: number;
  status?: InternshipStatus;
  companyName?: string;
  studentId?: string;
}

export const internshipsApi = {
  list: (query: InternshipQuery = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();
    return api.get<InternshipList>(`/internships${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api.get<Internship>(`/internships/${id}`),
  create: (input: CreateInternshipInput) => api.post<Internship>('/internships', input),
  update: (id: string, input: UpdateInternshipInput) => api.put<Internship>(`/internships/${id}`, input),
  remove: (id: string) => api.del<Internship>(`/internships/${id}`),
};
