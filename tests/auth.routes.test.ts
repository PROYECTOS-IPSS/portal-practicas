import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import bcrypt from 'bcryptjs';

// El módulo app lee SESSION_SECRET al importarse (dotenv no pisa vars existentes).
process.env['SESSION_SECRET'] = 'test-secret-para-vitest';
process.env['NODE_ENV'] = 'test';

vi.mock('../src/models/user.model.js', () => ({
  userModel: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

const PASSWORD = 'secreta123';
const publicUser = {
  id: 'u1',
  name: 'Ana Torres',
  email: 'ana@mail.com',
  role: 'STUDENT',
  major: null,
};

let server: Server;
let baseUrl: string;
let cookie = '';

const api = async (path: string, options: { method?: string; body?: unknown } = {}) => {
  const { method = 'GET', body } = options;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0] ?? '';
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: res.status, data };
};

// Refs al módulo mockeado; fullUser (con hash real) se construye en beforeAll.
let fullUser: (typeof publicUser & { passwordHash: string }) | null = null;
let mocked: ReturnType<typeof vi.mocked> | null = null;

const loginAsAna = async () => {
  cookie = '';
  mocked!.findByEmail.mockResolvedValue(fullUser);
  const result = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'ana@mail.com', password: PASSWORD },
  });
  expect(result.status).toBe(200);
  return result;
};

beforeAll(async () => {
  const hash = await bcrypt.hash(PASSWORD, 10);
  fullUser = { ...publicUser, passwordHash: hash };

  const { userModel } = await import('../src/models/user.model.js');
  mocked = vi.mocked(userModel);
  mocked.findByEmail.mockResolvedValue(null);
  mocked.create.mockResolvedValue(publicUser);
  mocked.findById.mockResolvedValue(publicUser);

  const { default: app } = await import('../src/app.js');
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
  vi.restoreAllMocks();
});

describe('POST /api/auth/register', () => {
  it('registra un estudiante, inicia sesión y responde 201 sin passwordHash', async () => {
    cookie = '';
    mocked!.findByEmail.mockResolvedValue(null);
    const { status, data } = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Ana Torres', email: 'ana@mail.com', password: PASSWORD },
    });

    expect(status).toBe(201);
    expect(data).toMatchObject({ id: 'u1', role: 'STUDENT', email: 'ana@mail.com' });
    expect(data).not.toHaveProperty('passwordHash');
    expect(cookie).toContain('connect.sid');
  });

  it('responde 400 si el email ya existe', async () => {
    cookie = '';
    mocked!.findByEmail.mockResolvedValue(fullUser);
    const { status, data } = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Ana', email: 'ana@mail.com', password: PASSWORD },
    });

    expect(status).toBe(400);
    expect(data).toMatchObject({ error: expect.stringContaining('Ya existe') });
  });

  it('responde 400 con body inválido (Zod, antes de tocar la BD)', async () => {
    cookie = '';
    const { status, data } = await api('/api/auth/register', {
      method: 'POST',
      body: { name: '', email: 'no-es-email', password: 'x' },
    });

    expect(status).toBe(400);
    expect(data).toMatchObject({ error: expect.stringContaining('Email inválido') });
  });
});

describe('POST /api/auth/login', () => {
  it('inicia sesión con credenciales correctas', async () => {
    const result = await loginAsAna();
    expect(result.data).toMatchObject({ id: 'u1', role: 'STUDENT' });
    expect(cookie).toContain('connect.sid');
  });

  it('responde 401 con contraseña incorrecta', async () => {
    cookie = '';
    mocked!.findByEmail.mockResolvedValue(fullUser);
    const { status, data } = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'ana@mail.com', password: 'incorrecta1' },
    });

    expect(status).toBe(401);
    expect(data).toMatchObject({ error: 'Credenciales inválidas' });
  });

  it('responde 401 con email inexistente (mismo mensaje)', async () => {
    cookie = '';
    mocked!.findByEmail.mockResolvedValue(null);
    const { status, data } = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'ghost@mail.com', password: PASSWORD },
    });

    expect(status).toBe(401);
    expect(data).toMatchObject({ error: 'Credenciales inválidas' });
  });
});

describe('GET /api/auth/session', () => {
  it('responde 401 sin sesión', async () => {
    cookie = '';
    const { status, data } = await api('/api/auth/session');

    expect(status).toBe(401);
    expect(data).toMatchObject({ error: 'Debes iniciar sesión' });
  });

  it('devuelve el usuario autenticado con la cookie de sesión', async () => {
    await loginAsAna();

    const { status, data } = await api('/api/auth/session');

    expect(status).toBe(200);
    expect(data).toMatchObject({ id: 'u1', email: 'ana@mail.com', role: 'STUDENT' });
  });
});

describe('POST /api/auth/logout', () => {
  it('cierra la sesión y el siguiente acceso responde 401', async () => {
    await loginAsAna();

    const logout = await api('/api/auth/logout', { method: 'POST' });
    expect(logout.status).toBe(200);

    const after = await api('/api/auth/session');
    expect(after.status).toBe(401);
  });
});
