import { describe, expect, it } from 'vitest';
import {
  createInternshipSchema,
  idParamSchema,
  internshipStatusSchema,
  listInternshipsQuerySchema,
  updateInternshipSchema,
} from '../src/schemas/internship.schema';

const validBody = {
  companyName: 'Empresa SA',
  companyAddress: 'Calle 1 #123',
  companyPhone: '+56 9 1111 2222',
  bossName: 'Jorge Díaz',
  bossContact: 'jorge@empresa.cl',
  description: 'Actividades de telecomunicaciones.',
  startDate: '2026-01-01',
  endDate: '2026-06-30',
  teacherId: 't1',
};

describe('createInternshipSchema', () => {
  it('acepta un registro válido de estudiante (sin studentId)', () => {
    const result = createInternshipSchema.parse(validBody);
    expect(result.studentId).toBeUndefined();
    expect(result.teacherId).toBe('t1');
  });

  it('acepta studentId cuando lo envía un profesor', () => {
    const result = createInternshipSchema.parse({ ...validBody, studentId: 's1' });
    expect(result.studentId).toBe('s1');
  });

  it('rechaza la ausencia de teacherId', () => {
    const body = { ...validBody } as Record<string, unknown>;
    delete body.teacherId;
    expect(() => createInternshipSchema.parse(body)).toThrow(/teacherId/);
  });

  it('rechaza endDate anterior a startDate', () => {
    expect(() => createInternshipSchema.parse({ ...validBody, startDate: '2026-12-01' })).toThrow(
      /endDate debe ser mayor o igual a startDate/,
    );
  });

  it('acepta fechas iguales', () => {
    const result = createInternshipSchema.parse({
      ...validBody,
      startDate: '2026-01-01',
      endDate: '2026-01-01',
    });
    expect(result.startDate).toBe('2026-01-01');
  });

  it('rechaza fechas mal formateadas', () => {
    expect(() => createInternshipSchema.parse({ ...validBody, startDate: '01/01/2026' })).toThrow(
      /fecha válida/,
    );
  });

  it('rechaza un string requerido vacío', () => {
    expect(() => createInternshipSchema.parse({ ...validBody, companyName: '   ' })).toThrow(
      /empresa es obligatorio/,
    );
  });
});

describe('updateInternshipSchema', () => {
  it('acepta una actualización parcial', () => {
    const result = updateInternshipSchema.parse({
      status: 'FINALIZADA',
      teacherId: 't2',
    });
    expect(result).toEqual({ status: 'FINALIZADA', teacherId: 't2' });
  });

  it('permite reasignar teacherId', () => {
    const result = updateInternshipSchema.parse({ teacherId: 't3' });
    expect(result.teacherId).toBe('t3');
  });

  it('rechaza studentId (inmutable tras la creación)', () => {
    expect(() => updateInternshipSchema.parse({ companyName: 'Otra', studentId: 's9' })).toThrow(
      /studentId/,
    );
  });

  it('rechaza un status inválido', () => {
    expect(() => updateInternshipSchema.parse({ status: 'BORRADA' })).toThrow();
  });

  it('rechaza endDate anterior a startDate cuando ambas se envían', () => {
    expect(() =>
      updateInternshipSchema.parse({ startDate: '2026-12-01', endDate: '2026-01-01' }),
    ).toThrow(/endDate debe ser mayor o igual a startDate/);
  });

  it('no exige fechas coherentes si se actualiza un solo campo', () => {
    const result = updateInternshipSchema.parse({ companyName: 'Nueva' });
    expect(result.companyName).toBe('Nueva');
  });
});

describe('internshipStatusSchema', () => {
  it('acepta solo los estados ACTIVA | FINALIZADA | EVALUADA', () => {
    expect(internshipStatusSchema.options).toEqual(['ACTIVA', 'FINALIZADA', 'EVALUADA']);
  });
});

describe('idParamSchema', () => {
  it('acepta un id no vacío', () => {
    expect(idParamSchema.parse({ id: 'abc123' }).id).toBe('abc123');
  });

  it('rechaza un id vacío', () => {
    expect(() => idParamSchema.parse({ id: '   ' })).toThrow(/obligatorio/);
  });
});

describe('listInternshipsQuerySchema', () => {
  it('aplica defaults de paginación', () => {
    const result = listInternshipsQuerySchema.parse({});
    expect(result).toEqual({ page: 1, pageSize: 10 });
  });

  it('coercea page y pageSize desde strings', () => {
    const result = listInternshipsQuerySchema.parse({ page: '3', pageSize: '50' });
    expect(result).toEqual({ page: 3, pageSize: 50 });
  });

  it('rechaza pageSize mayor a 50', () => {
    expect(() => listInternshipsQuerySchema.parse({ pageSize: 51 })).toThrow();
  });

  it('rechaza page no numérica', () => {
    expect(() => listInternshipsQuerySchema.parse({ page: 'abc' })).toThrow();
  });

  it('acepta filtros opcionales', () => {
    const result = listInternshipsQuerySchema.parse({
      status: 'ACTIVA',
      companyName: 'tele',
      studentId: 's1',
    });
    expect(result).toMatchObject({ status: 'ACTIVA', companyName: 'tele', studentId: 's1' });
  });
});
