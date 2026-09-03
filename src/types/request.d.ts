import 'express';

// Datos validados por el middleware `validate` (Zod), disponibles para los
// controllers. Se guardan aquí porque en Express 5 req.query/req.params son
// getters de solo lectura (no se pueden reemplazar in-place).
declare module 'express-serve-static-core' {
  interface Request {
    validated?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}
