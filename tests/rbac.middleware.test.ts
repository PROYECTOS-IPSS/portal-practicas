import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import type { SessionData } from 'express-session';
import { HttpError } from '../src/errors.js';
import { requireRole, requireStudent, requireTeacher } from '../src/middleware/rbac.middleware.js';

const makeReq = (sessionData: Partial<SessionData>) =>
  ({ session: { ...sessionData } }) as unknown as Request;

const makeRes = () => ({}) as unknown as Response;

const firstError = (next: ReturnType<typeof vi.fn>) => next.mock.calls[0]?.[0] as HttpError;

describe('requireRole', () => {
  it('responde 401 si no hay sesión activa', () => {
    const next = vi.fn();
    requireRole(['TEACHER'])(makeReq({}), makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 401 });
  });

  it('responde 403 si el rol no está permitido', () => {
    const next = vi.fn();
    requireRole(['TEACHER'])(makeReq({ userId: 'u1', role: 'STUDENT' }), makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 403 });
  });

  it('deja pasar cuando el rol está permitido', () => {
    const next = vi.fn();
    requireRole(['TEACHER'])(makeReq({ userId: 'u1', role: 'TEACHER' }), makeRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });
});

describe('requireTeacher / requireStudent', () => {
  it('requireTeacher bloquea a estudiantes con 403', () => {
    const next = vi.fn();
    requireTeacher(makeReq({ userId: 'u1', role: 'STUDENT' }), makeRes(), next);

    expect(firstError(next)).toMatchObject({ status: 403 });
  });

  it('requireTeacher deja pasar a profesores', () => {
    const next = vi.fn();
    requireTeacher(makeReq({ userId: 'u1', role: 'TEACHER' }), makeRes(), next);

    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });

  it('requireStudent deja pasar a estudiantes', () => {
    const next = vi.fn();
    requireStudent(makeReq({ userId: 'u1', role: 'STUDENT' }), makeRes(), next);

    expect(next.mock.calls[0]?.[0]).toBeUndefined();
  });
});
