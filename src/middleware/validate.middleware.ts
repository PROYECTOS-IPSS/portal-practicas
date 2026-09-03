import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../errors.js';

type ValidationSource = 'body' | 'query' | 'params';

/**
 * Middleware de validación Zod (AGENTS: validar antes de tocar la BD).
 * Parsea req[source] y lo reemplaza por el resultado saneado; si falla,
 * responde 400 con los mensajes del esquema sin ejecutar el controller.
 */
export const validate =
  (schema: ZodType, source: ValidationSource = 'body'): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('; ');
      next(new HttpError(400, message || 'Datos inválidos'));
      return;
    }

    const target = req as unknown as Record<ValidationSource, unknown>;
    target[source] = parsed.data;
    next();
  };
