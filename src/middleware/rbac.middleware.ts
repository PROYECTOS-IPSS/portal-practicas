import type { RequestHandler } from 'express';
import { HttpError } from '../errors.js';
import type { UserRole } from '../generated/prisma/enums.js';

/**
 * Fábrica de middlewares RBAC. Uso: router.put('/x', requireRole(['TEACHER']), ...).
 * Sin sesión responde 401; con sesión pero rol no permitido responde 403.
 */
export const requireRole =
  (allowedRoles: readonly UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.session.userId || !req.session.role) {
      next(new HttpError(401, 'Debes iniciar sesión'));
      return;
    }
    if (!allowedRoles.includes(req.session.role)) {
      next(new HttpError(403, 'No tienes permisos para realizar esta acción'));
      return;
    }
    next();
  };

// Atajos por rol del MVP.
export const requireTeacher = requireRole(['TEACHER']);
export const requireStudent = requireRole(['STUDENT']);
