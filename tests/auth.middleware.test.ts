import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import type { SessionData } from 'express-session';
import { HttpError } from '../src/errors.js';
import { requireAuth } from '../src/middleware/auth.middleware.js';

const makeReq = (sessionData: Partial<SessionData>) =>
  ({ session: { ...sessionData } }) as unknown as Request;

const makeRes = () => ({}) as unknown as Response;

describe('requireAuth', () => {
  it('llama next(error 401) cuando no hay sesión', () => {
    const next = vi.fn();
    requireAuth(makeReq({}), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0]?.[0] as HttpError;
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(401);
  });

  it('llama next(error 401) cuando falta userId pese a haber cookie', () => {
    const next = vi.fn();
    requireAuth(makeReq({ role: 'STUDENT' }), makeRes(), next);

    const err = next.mock.calls[0]?.[0] as HttpError;
    expect(err.status).toBe(401);
  });

  it('deja pasar cuando la sesión tiene userId y role', () => {
    const next = vi.fn();
    requireAuth(makeReq({ userId: 'u1', role: 'STUDENT' }), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });
});
