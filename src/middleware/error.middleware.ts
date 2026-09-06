import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../errors.js';

// Convierte errores de la aplicación en respuestas JSON.
// HttpError lleva su status; el resto es 500 genérico (sin filtrar detalles internos).
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: { error: string; fieldErrors?: Record<string, string> } = { error: err.message };
    if (err.fieldErrors) body.fieldErrors = err.fieldErrors;
    res.status(err.status).json(body);
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};
