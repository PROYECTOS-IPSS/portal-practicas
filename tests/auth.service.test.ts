import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { authService } from '../src/services/auth.service.js';
import { userModel } from '../src/models/user.model.js';

vi.mock('../src/models/user.model.js', () => ({
  userModel: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

const mockedModel = vi.mocked(userModel);

const PASSWORD = 'secreta123';
let hash: string;

beforeAll(async () => {
  hash = await bcrypt.hash(PASSWORD, 10);
});

// Factory: se evalúa tras beforeAll (cuando hash ya existe).
const buildFullUser = () => ({
  id: 'u1',
  name: 'Ana Torres',
  email: 'ana@mail.com',
  passwordHash: hash,
  role: 'STUDENT' as const,
  major: 'Telecomunicaciones',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const publicUser = {
  id: 'u1',
  name: 'Ana Torres',
  email: 'ana@mail.com',
  role: 'STUDENT' as const,
  major: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authService.register', () => {
  it('crea un usuario STUDENT con email normalizado y password hasheada', async () => {
    mockedModel.findByEmail.mockResolvedValue(null);
    mockedModel.create.mockResolvedValue(publicUser);

    const result = await authService.register({
      name: '  Ana Torres ',
      email: '  ANA@Mail.COM ',
      password: PASSWORD,
    });

    expect(mockedModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ana@mail.com',
        role: 'STUDENT',
        passwordHash: expect.not.stringMatching(PASSWORD),
      }),
    );
    const [data] = mockedModel.create.mock.calls[0] ?? [];
    expect(data?.passwordHash.startsWith('$2')).toBe(true);
    expect(result).toEqual(publicUser);
  });

  it('envía major como null cuando no se provee', async () => {
    mockedModel.findByEmail.mockResolvedValue(null);
    mockedModel.create.mockResolvedValue(publicUser);

    await authService.register({ name: 'Ana', email: 'ana@mail.com', password: PASSWORD });

    expect(mockedModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ major: null }),
    );
  });

  it('rechaza con 400 si el email ya está registrado y no crea nada', async () => {
    mockedModel.findByEmail.mockResolvedValue(buildFullUser());

    await expect(
      authService.register({ name: 'Ana', email: 'ana@mail.com', password: PASSWORD }),
    ).rejects.toMatchObject({ status: 400 });
    expect(mockedModel.create).not.toHaveBeenCalled();
  });
});

describe('authService.login', () => {
  it('devuelve el usuario público con credenciales correctas', async () => {
    mockedModel.findByEmail.mockResolvedValue(buildFullUser());

    const result = await authService.login({ email: 'ana@mail.com', password: PASSWORD });

    expect(result).toEqual({
      id: 'u1',
      name: 'Ana Torres',
      email: 'ana@mail.com',
      role: 'STUDENT',
      major: 'Telecomunicaciones',
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('rechaza con 401 una contraseña incorrecta', async () => {
    mockedModel.findByEmail.mockResolvedValue(buildFullUser());

    await expect(
      authService.login({ email: 'ana@mail.com', password: 'incorrecta1' }),
    ).rejects.toMatchObject({ status: 401, message: 'Credenciales inválidas' });
  });

  it('rechaza con 401 un email inexistente con el mismo mensaje', async () => {
    mockedModel.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'nadie@mail.com', password: PASSWORD }),
    ).rejects.toMatchObject({ status: 401, message: 'Credenciales inválidas' });
  });
});
