import { prisma } from '../config/prisma.js';
import type { UserRole } from '../generated/prisma/enums.js';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  major: string | null;
};

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  major: string | null;
};

// Selección pública: nunca expone passwordHash fuera del model.
const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  major: true,
} as const;

export const userModel = {
  /** Usuario completo (incluye passwordHash). Solo para autenticación interna. */
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicSelect });
  },

  create(data: CreateUserData) {
    return prisma.user.create({ data, select: publicSelect });
  },

  /** Lista de profesores (para que el estudiante elija supervisor). */
  listTeachers() {
    return prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  },

  /** Lista de estudiantes (para el selector del profesor al crear). */
  listStudents() {
    return prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
  },
};
