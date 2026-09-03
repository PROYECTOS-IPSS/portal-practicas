import { HttpError } from '../errors.js';
import { userModel } from '../models/user.model.js';
import { internshipModel } from '../models/internship.model.js';
import type {
  CreateInternshipInput,
  ListInternshipsQuery,
  UpdateInternshipInput,
} from '../schemas/internship.schema.js';
import type { InternshipStatus, UserRole } from '../generated/prisma/enums.js';
import type { Prisma } from '../generated/prisma/client.js';

export type Actor = { id: string; role: UserRole };

// Transiciones permitidas de estado (solo profesor): ACTIVA → FINALIZADA → EVALUADA.
const STATUS_FLOW: Record<InternshipStatus, readonly InternshipStatus[]> = {
  ACTIVA: ['FINALIZADA'],
  FINALIZADA: ['EVALUADA'],
  EVALUADA: [],
};

const toUtcDate = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

const NOT_FOUND_MESSAGE = 'Práctica no encontrada';

const findUserRole = async (id: string): Promise<UserRole | null> => {
  const user = await userModel.findById(id);
  return user ? user.role : null;
};

const assertRole = async (id: string, expected: UserRole, fieldName: string) => {
  const role = await findUserRole(id);
  if (role !== expected) {
    throw new HttpError(400, `${fieldName} debe pertenecer a un usuario con rol ${expected}`);
  }
};

const assertNoActiveInternship = async (studentId: string) => {
  const activeCount = await internshipModel.countActiveByStudentId(studentId);
  if (activeCount > 0) {
    throw new HttpError(400, 'El estudiante ya tiene una práctica ACTIVA');
  }
};

export const internshipService = {
  /**
   * POST /api/internships.
   * STUDENT: studentId se fija desde la sesión (el body nunca decide el dueño).
   * TEACHER: studentId es obligatorio y debe ser rol STUDENT.
   * Ambos: teacherId obligatorio y rol TEACHER; una sola práctica ACTIVA por estudiante.
   */
  async create(actor: Actor, input: CreateInternshipInput) {
    let studentId: string;
    if (actor.role === 'TEACHER') {
      if (!input.studentId) {
        throw new HttpError(400, 'Como profesor debes indicar el studentId del estudiante');
      }
      studentId = input.studentId;
      const role = await findUserRole(studentId);
      if (role !== 'STUDENT') {
        throw new HttpError(400, 'studentId debe pertenecer a un usuario con rol STUDENT');
      }
    } else {
      studentId = actor.id;
    }

    await assertRole(input.teacherId, 'TEACHER', 'teacherId');
    await assertNoActiveInternship(studentId);

    return internshipModel.create({
      studentId,
      teacherId: input.teacherId,
      companyName: input.companyName,
      companyAddress: input.companyAddress,
      companyPhone: input.companyPhone,
      bossName: input.bossName,
      bossContact: input.bossContact,
      startDate: toUtcDate(input.startDate),
      endDate: toUtcDate(input.endDate),
      description: input.description,
      status: 'ACTIVA',
    });
  },

  /**
   * GET /api/internships/:id.
   * Un estudiante solo ve sus propias prácticas; una ajena responde 404
   * (no se revela si el registro existe). Los borrados responden 404.
   */
  async getById(actor: Actor, id: string) {
    const record = await internshipModel.findActiveById(id);
    if (!record || (actor.role === 'STUDENT' && record.studentId !== actor.id)) {
      throw new HttpError(404, NOT_FOUND_MESSAGE);
    }
    return record;
  },

  /**
   * GET /api/internships — paginado con filtros.
   * STUDENT: solo sus registros y sin filtro studentId (400 si lo envía).
   * TEACHER: todos, con filtros status/companyName/studentId.
   */
  async list(actor: Actor, query: ListInternshipsQuery) {
    const where: Prisma.InternshipRecordWhereInput = { deletedAt: null };

    if (query.status) where.status = query.status;
    if (query.companyName) {
      where.companyName = { contains: query.companyName, mode: 'insensitive' };
    }

    if (actor.role === 'STUDENT') {
      if (query.studentId) {
        throw new HttpError(400, 'Un estudiante no puede filtrar por studentId');
      }
      where.studentId = actor.id;
    } else if (query.studentId) {
      where.studentId = query.studentId;
    }

    const skip = (query.page - 1) * query.pageSize;
    const [records, total] = await Promise.all([
      internshipModel.listActive(where, skip, query.pageSize),
      internshipModel.countActive(where),
    ]);

    return { records, total, page: query.page, pageSize: query.pageSize };
  },

  /**
   * PUT /api/internships/:id (solo profesor; defense en depth además del RBAC).
   * teacherId reasignable (validado TEACHER); status avanza por la secuencia
   * ACTIVA → FINALIZADA → EVALUADA (retrocesos y saltos responden 400).
   * studentId nunca es modificable (el esquema PUT lo rechaza antes).
   */
  async update(actor: Actor, id: string, input: UpdateInternshipInput) {
    if (actor.role !== 'TEACHER') {
      throw new HttpError(403, 'No tienes permisos para realizar esta acción');
    }

    const record = await internshipModel.findActiveById(id);
    if (!record) {
      throw new HttpError(404, NOT_FOUND_MESSAGE);
    }

    const data: Prisma.InternshipRecordUncheckedUpdateInput = {};

    const simpleFields = [
      'companyName',
      'companyAddress',
      'companyPhone',
      'bossName',
      'bossContact',
      'description',
    ] as const;
    for (const field of simpleFields) {
      if (input[field] !== undefined) data[field] = input[field];
    }

    if (input.startDate !== undefined) data.startDate = toUtcDate(input.startDate);
    if (input.endDate !== undefined) data.endDate = toUtcDate(input.endDate);

    if (input.teacherId !== undefined) {
      await assertRole(input.teacherId, 'TEACHER', 'teacherId');
      data.teacherId = input.teacherId;
    }

    if (input.status !== undefined && input.status !== record.status) {
      const next = STATUS_FLOW[record.status];
      if (!next.includes(input.status)) {
        throw new HttpError(
          400,
          `No se puede pasar de ${record.status} a ${input.status} (secuencia: ACTIVA → FINALIZADA → EVALUADA)`,
        );
      }
      data.status = input.status;
    }

    return internshipModel.update(id, data);
  },

  /** DELETE /api/internships/:id (solo profesor): borrado lógico con deletedAt. */
  async softDelete(actor: Actor, id: string) {
    if (actor.role !== 'TEACHER') {
      throw new HttpError(403, 'No tienes permisos para realizar esta acción');
    }

    const record = await internshipModel.findActiveById(id);
    if (!record) {
      throw new HttpError(404, NOT_FOUND_MESSAGE);
    }

    return internshipModel.softDelete(id);
  },
};
