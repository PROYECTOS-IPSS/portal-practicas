import type { RequestHandler } from 'express';
import { HttpError } from '../errors.js';

// Bloquea peticiones sin sesión activa. La cookie HTTP-only la maneja express-session.
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.session.userId || !req.session.role) {
    next(new HttpError(401, 'Debes iniciar sesión'));
    return;
  }
  next();
};
