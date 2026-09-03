import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { HttpError } from '../src/errors.js';
import { validate } from '../src/middleware/validate.middleware.js';
import { loginSchema } from '../src/schemas/auth.schema.js';
import { idParamSchema, listInternshipsQuerySchema } from '../src/schemas/internship.schema.js';

const makeRes = () => ({}) as unknown as Response;

const firstError = (next: ReturnType<typeof vi.fn>) => next.mock.calls[0]?.[0] as HttpError;

describe('validate (middleware Zod)', () => {
  it('reemplaza req.body por el dato saneado y continúa', () => {
    const req = { body: { email: 'ana@mail.com', password: 'secreta123' } } as Request;
    const next = vi.fn();

    validate(loginSchema)(req, makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
    expect(req.body).toEqual({ email: 'ana@mail.com', password: 'secreta123' });
  });

  it('responde 400 con los mensajes del esquema si el body es inválido', () => {
    const req = { body: { email: 'no-es-email', password: '' } } as Request;
    const next = vi.fn();

    validate(loginSchema)(req, makeRes(), next);

    const err = firstError(next);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(400);
    expect(err.message).toContain('Email inválido');
    expect(err.message).toContain('La contraseña es obligatoria');
  });

  it('valida params con su esquema', () => {
    const req = { params: { id: '   ' } } as unknown as Request;
    const next = vi.fn();

    validate(idParamSchema, 'params')(req, makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 400 });
  });

  it('coercea y aplica defaults de query (page string → number)', () => {
    const req = { query: { page: '3' } } as unknown as Request;
    const next = vi.fn();

    validate(listInternshipsQuerySchema, 'query')(req, makeRes(), next);

    expect(next.mock.calls[0]?.[0]).toBeUndefined();
    expect(req.query).toMatchObject({ page: 3, pageSize: 10 });
  });

  it('rechaza query con pageSize fuera de rango', () => {
    const req = { query: { pageSize: '99' } } as unknown as Request;
    const next = vi.fn();

    validate(listInternshipsQuerySchema, 'query')(req, makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 400 });
  });
});
