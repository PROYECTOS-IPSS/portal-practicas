import type { RequestHandler } from 'express';
import { userService } from '../services/user.service.js';

export const userController = {
  // GET /api/teachers — lista { id, name } de profesores (supervisores).
  listTeachers: (async (_req, res) => {
    const teachers = await userService.listTeachers();
    res.status(200).json(teachers);
  }) as RequestHandler,

  // GET /api/students — lista { id, name, email } de estudiantes (solo profesor).
  listStudents: (async (_req, res) => {
    const students = await userService.listStudents();
    res.status(200).json(students);
  }) as RequestHandler,
};
