import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { Request, Response } from 'express';
import { HttpError } from '../src/errors.js';
import { validate } from '../src/middleware/validate.middleware.js';
import { loginSchema } from '../src/schemas/auth.schema.js';
import { idParamSchema, listInternshipsQuerySchema } from '../src/schemas/internship.schema.js';

// Request falsa con el campo que el middleware puebla (ver src/types/request.d.ts).
type ValidatedRequest = Request & {
  validated?: { body?: unknown; query?: unknown; params?: unknown };
};

const validatedOf = (req: Request) => {
  const withValidated = req as ValidatedRequest;
  return withValidated.validated;
};

const firstError = (next: Mock) => next.mock.calls[0]?.[0] as HttpError;

const makeRes = () => ({}) as unknown as Response;

describe('validate (middleware Zod)', () => {
  it('guarda el body saneado en req.validated y continúa', () => {
    const req = { body: { email: 'ana@mail.com', password: 'secreta123' } } as ValidatedRequest;
    const next = vi.fn();

    validate(loginSchema)(req, makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
    expect(validatedOf(req)?.body).toEqual({ email: 'ana@mail.com', password: 'secreta123' });
  });

  it('responde 400 con los mensajes del esquema si el body es inválido', () => {
    const req = { body: { email: 'no-es-email', password: '' } } as ValidatedRequest;
    const next = vi.fn();

    validate(loginSchema)(req, makeRes(), next);

    const err = firstError(next);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(400);
    expect(err.message).toContain('Email inválido');
    expect(err.message).toContain('La contraseña es obligatoria');
  });

  it('valida params con su esquema', () => {
    const req = { params: { id: '   ' } } as ValidatedRequest;
    const next = vi.fn();

    validate(idParamSchema, 'params')(req, makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 400 });
  });

  it('coercea y aplica defaults de query (page string → número)', () => {
    const req = { query: { page: '3' } } as ValidatedRequest;
    const next = vi.fn();

    validate(listInternshipsQuerySchema, 'query')(req, makeRes(), next);

    expect(next.mock.calls[0]?.[0]).toBeUndefined();
    expect(validatedOf(req)?.query).toEqual({ page: 3, pageSize: 10 });
  });

  it('rechaza query con pageSize fuera de rango', () => {
    const req = { query: { pageSize: '99' } } as ValidatedRequest;
    const next = vi.fn();

    validate(listInternshipsQuerySchema, 'query')(req, makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 400 });
  });
});
