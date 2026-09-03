import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { internshipService } from '../src/services/internship.service.js';
import { internshipModel } from '../src/models/internship.model.js';
import { userModel } from '../src/models/user.model.js';
import type { InternshipWithPeople } from '../src/models/internship.model.js';

vi.mock('../src/models/internship.model.js', () => ({
  internshipModel: {
    findActiveById: vi.fn(),
    listActive: vi.fn(),
    countActive: vi.fn(),
    countActiveByStudentId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock('../src/models/user.model.js', () => ({
  userModel: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
  },
}));

const mockedInternshipModel = vi.mocked(internshipModel);
const mockedUserModel = vi.mocked(userModel);

const teacher = { id: 't1', name: 'Profe Uno', email: 't1@mail.com', role: 'TEACHER', major: null };
const teacher2 = { id: 't2', name: 'Profe Dos', email: 't2@mail.com', role: 'TEACHER', major: null };
const student = { id: 's1', name: 'Ana', email: 'ana@mail.com', role: 'STUDENT', major: 'Teleco' };

const makeRecord = (overrides: Partial<InternshipWithPeople> = {}): InternshipWithPeople => ({
  id: 'r1',
  studentId: 's1',
  teacherId: 't1',
  companyName: 'Empresa SA',
  companyAddress: 'Calle 1',
  companyPhone: '123',
  bossName: 'Jefe',
  bossContact: 'jefe@mail.com',
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2026-06-30T00:00:00.000Z'),
  description: 'Actividades',
  status: 'ACTIVA',
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  student: { id: 's1', name: 'Ana', email: 'ana@mail.com' },
  teacher: { id: 't1', name: 'Profe Uno' },
  ...overrides,
});

const validInput = {
  companyName: 'Empresa SA',
  companyAddress: 'Calle 1',
  companyPhone: '123',
  bossName: 'Jefe',
  bossContact: 'jefe@mail.com',
  description: 'Actividades',
  startDate: '2026-01-01',
  endDate: '2026-06-30',
  teacherId: 't1',
};

const studentActor = { id: 's1', role: 'STUDENT' as const };
const teacherActor = { id: 't1', role: 'TEACHER' as const };

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('internshipService.create', () => {
  it('STUDENT: fija studentId desde la sesión e ignora el del body', async () => {
    mockedUserModel.findById.mockResolvedValue(teacher);
    mockedInternshipModel.countActiveByStudentId.mockResolvedValue(0);
    mockedInternshipModel.create.mockResolvedValue(makeRecord());

    const input = { ...validInput, studentId: 's999' };
    await internshipService.create(studentActor, input);

    expect(mockedInternshipModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 's1', teacherId: 't1', status: 'ACTIVA' }),
    );
  });

  it('STUDENT sin práctica ACTIVA crea con fechas UTC y estado ACTIVA', async () => {
    mockedUserModel.findById.mockResolvedValue(teacher);
    mockedInternshipModel.countActiveByStudentId.mockResolvedValue(0);
    mockedInternshipModel.create.mockResolvedValue(makeRecord());

    await internshipService.create(studentActor, validInput);

    const [data] = mockedInternshipModel.create.mock.calls[0] ?? [];
    expect(data?.startDate).toEqual(new Date('2026-01-01T00:00:00.000Z'));
    expect(data?.endDate).toEqual(new Date('2026-06-30T00:00:00.000Z'));
  });

  it('STUDENT con práctica ACTIVA existente responde 400', async () => {
    mockedUserModel.findById.mockResolvedValue(teacher);
    mockedInternshipModel.countActiveByStudentId.mockResolvedValue(1);

    await expect(internshipService.create(studentActor, validInput)).rejects.toMatchObject({
      status: 400,
    });
    expect(mockedInternshipModel.create).not.toHaveBeenCalled();
  });

  it('TEACHER: exige studentId en el input', async () => {
    await expect(internshipService.create(teacherActor, validInput)).rejects.toMatchObject({
      status: 400,
    });
  });

  it('TEACHER: crea en nombre de un estudiante válido', async () => {
    mockedUserModel.findById.mockResolvedValueOnce(student);
    mockedInternshipModel.countActiveByStudentId.mockResolvedValue(0);
    mockedInternshipModel.create.mockResolvedValue(makeRecord());

    await internshipService.create(teacherActor, { ...validInput, studentId: 's1' });

    expect(mockedInternshipModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 's1' }),
    );
  });

  it('TEACHER: studentId inexistente o no STUDENT responde 400', async () => {
    mockedUserModel.findById.mockResolvedValue(null);
    await expect(
      internshipService.create(teacherActor, { ...validInput, studentId: 'ghost' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('teacherId que no es rol TEACHER responde 400', async () => {
    mockedUserModel.findById.mockResolvedValue(student); // s1 es STUDENT
    await expect(internshipService.create(studentActor, validInput)).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('teacherId'),
    });
  });
});

describe('internshipService.getById', () => {
  it('TEACHER puede leer cualquier práctica activa', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    const record = await internshipService.getById(teacherActor, 'r1');
    expect(record.studentId).toBe('s1');
  });

  it('STUDENT lee su propia práctica', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    await expect(internshipService.getById(studentActor, 'r1')).resolves.toBeDefined();
  });

  it('STUDENT recibe 404 con práctica ajena (no revela existencia)', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    await expect(
      internshipService.getById({ id: 's2', role: 'STUDENT' }, 'r1'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('registro borrado o inexistente responde 404 para ambos roles', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(null);
    await expect(internshipService.getById(teacherActor, 'r1')).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('internshipService.list', () => {
  it('STUDENT lista solo sus registros con paginación', async () => {
    mockedInternshipModel.listActive.mockResolvedValue([makeRecord()]);
    mockedInternshipModel.countActive.mockResolvedValue(1);

    const result = await internshipService.list(studentActor, { page: 1, pageSize: 10 });

    expect(mockedInternshipModel.listActive).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: null, studentId: 's1' }),
      0,
      10,
    );
    expect(result).toMatchObject({ total: 1, page: 1, pageSize: 10 });
  });

  it('STUDENT que envía studentId como filtro recibe 400', async () => {
    await expect(
      internshipService.list(studentActor, { page: 1, pageSize: 10, studentId: 's9' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('TEACHER filtra por status, companyName (insensitive) y studentId', async () => {
    mockedInternshipModel.listActive.mockResolvedValue([]);
    mockedInternshipModel.countActive.mockResolvedValue(0);

    await internshipService.list(teacherActor, {
      page: 2,
      pageSize: 5,
      status: 'ACTIVA',
      companyName: 'Tele',
      studentId: 's1',
    });

    expect(mockedInternshipModel.listActive).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ACTIVA',
        companyName: { contains: 'Tele', mode: 'insensitive' },
        studentId: 's1',
      }),
      5,
      5,
    );
  });

  it('los borrados nunca aparecen: where siempre incluye deletedAt: null', async () => {
    mockedInternshipModel.listActive.mockResolvedValue([]);
    mockedInternshipModel.countActive.mockResolvedValue(0);

    await internshipService.list(teacherActor, { page: 1, pageSize: 10 });

    expect(mockedInternshipModel.listActive).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: null }),
      expect.anything(),
      expect.anything(),
    );
  });
});

describe('internshipService.update', () => {
  it('bloquea a STUDENT con 403', async () => {
    await expect(
      internshipService.update(studentActor, 'r1', { companyName: 'X' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('registro inexistente o borrado responde 404', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(null);
    await expect(
      internshipService.update(teacherActor, 'r1', { companyName: 'X' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('actualiza campos simples y convierte fechas', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    mockedInternshipModel.update.mockResolvedValue(makeRecord({ companyName: 'Nueva' }));

    await internshipService.update(teacherActor, 'r1', {
      companyName: 'Nueva',
      startDate: '2026-05-01',
    });

    const [id, data] = mockedInternshipModel.update.mock.calls[0] ?? [];
    expect(id).toBe('r1');
    expect(data).toMatchObject({ companyName: 'Nueva' });
    expect(data?.startDate).toEqual(new Date('2026-05-01T00:00:00.000Z'));
    expect(data).not.toHaveProperty('studentId');
  });

  it('reasigna teacherId tras validarlo como TEACHER', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    mockedUserModel.findById.mockResolvedValue(teacher2);
    mockedInternshipModel.update.mockResolvedValue(makeRecord({ teacherId: 't2' }));

    await internshipService.update(teacherActor, 'r1', { teacherId: 't2' });

    const [, data] = mockedInternshipModel.update.mock.calls[0] ?? [];
    expect(data?.teacherId).toBe('t2');
  });

  it('rechaza teacherId que no es rol TEACHER', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    mockedUserModel.findById.mockResolvedValue(student);

    await expect(
      internshipService.update(teacherActor, 'r1', { teacherId: 's1' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('avanza ACTIVA → FINALIZADA', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    mockedInternshipModel.update.mockResolvedValue(makeRecord({ status: 'FINALIZADA' }));

    await internshipService.update(teacherActor, 'r1', { status: 'FINALIZADA' });

    const [, data] = mockedInternshipModel.update.mock.calls[0] ?? [];
    expect(data?.status).toBe('FINALIZADA');
  });

  it('rechaza salto ACTIVA → EVALUADA', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());

    await expect(
      internshipService.update(teacherActor, 'r1', { status: 'EVALUADA' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rechaza retroceso FINALIZADA → ACTIVA', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord({ status: 'FINALIZADA' }));

    await expect(
      internshipService.update(teacherActor, 'r1', { status: 'ACTIVA' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('internshipService.softDelete', () => {
  it('bloquea a STUDENT con 403', async () => {
    await expect(internshipService.softDelete(studentActor, 'r1')).rejects.toMatchObject({
      status: 403,
    });
  });

  it('TEACHER aplica soft delete al registro activo', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(makeRecord());
    mockedInternshipModel.softDelete.mockResolvedValue(makeRecord({ deletedAt: new Date() }));

    await internshipService.softDelete(teacherActor, 'r1');

    expect(mockedInternshipModel.softDelete).toHaveBeenCalledWith('r1');
  });

  it('registro inexistente o ya borrado responde 404', async () => {
    mockedInternshipModel.findActiveById.mockResolvedValue(null);
    await expect(internshipService.softDelete(teacherActor, 'r1')).rejects.toMatchObject({
      status: 404,
    });
  });
});
