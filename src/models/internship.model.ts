import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

// Personas asociadas al registro: nombres/emails vienen del User, no se duplican.
const includePeople: Prisma.InternshipRecordInclude = {
  student: { select: { id: true, name: true, email: true } },
  teacher: { select: { id: true, name: true } },
};

export type InternshipWithPeople = Prisma.InternshipRecordGetPayload<{
  include: typeof includePeople;
}>;

export const internshipModel = {
  findActiveById(id: string) {
    return prisma.internshipRecord.findUnique({
      where: { id, deletedAt: null },
      include: includePeople,
    });
  },

  listActive(where: Prisma.InternshipRecordWhereInput, skip: number, take: number) {
    return prisma.internshipRecord.findMany({
      where,
      include: includePeople,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  countActive(where: Prisma.InternshipRecordWhereInput) {
    return prisma.internshipRecord.count({ where });
  },

  countActiveByStudentId(studentId: string) {
    return prisma.internshipRecord.count({
      where: { studentId, status: 'ACTIVA', deletedAt: null },
    });
  },

  create(data: Prisma.InternshipRecordUncheckedCreateInput) {
    return prisma.internshipRecord.create({ data, include: includePeople });
  },

  update(id: string, data: Prisma.InternshipRecordUncheckedUpdateInput) {
    return prisma.internshipRecord.update({ where: { id }, data, include: includePeople });
  },

  softDelete(id: string) {
    return prisma.internshipRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: includePeople,
    });
  },
};
