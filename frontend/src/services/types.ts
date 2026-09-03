export type Role = 'STUDENT' | 'TEACHER';
export type InternshipStatus = 'ACTIVA' | 'FINALIZADA' | 'EVALUADA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  major: string | null;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
}

export interface Teacher {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
}

export interface Internship {
  id: string;
  studentId: string;
  teacherId: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  bossName: string;
  bossContact: string;
  startDate: string;
  endDate: string;
  description: string;
  status: InternshipStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: Person;
  teacher: Person;
}

export interface InternshipList {
  records: Internship[];
  total: number;
  page: number;
  pageSize: number;
}
