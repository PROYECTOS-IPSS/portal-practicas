import { z } from 'zod';

export const internshipStatusSchema = z.enum(['ACTIVA', 'FINALIZADA', 'EVALUADA']);

// Fechas en formato ISO date-only (YYYY-MM-DD); se admiten fechas pasadas.
// La comparación lexicográfica es válida para este formato.
const companyDataSchema = {
  companyName: z.string().trim().min(1, 'El nombre de la empresa es obligatorio').max(200),
  companyAddress: z.string().trim().min(1, 'La dirección es obligatoria').max(300),
  companyPhone: z.string().trim().min(1, 'El teléfono es obligatorio').max(50),
  bossName: z.string().trim().min(1, 'El nombre del jefe es obligatorio').max(200),
  bossContact: z.string().trim().min(1, 'El contacto del jefe es obligatorio').max(200),
  description: z.string().trim().min(1, 'La descripción es obligatoria').max(2000),
};

// POST /api/internships.
// - teacherId: obligatorio para ambos roles (el service valida que sea rol TEACHER).
// - studentId: opcional en el esquema; un profesor debe enviarlo y el service lo
//   exige según su rol. Un estudiante nunca lo envía: el service lo toma de la sesión.
export const createInternshipSchema = z
  .object({
    ...companyDataSchema,
    startDate: z.iso.date('startDate debe ser una fecha válida (YYYY-MM-DD)'),
    endDate: z.iso.date('endDate debe ser una fecha válida (YYYY-MM-DD)'),
    teacherId: z.string().min(1, 'teacherId es obligatorio'),
    studentId: z.string().min(1).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate debe ser mayor o igual a startDate',
    path: ['endDate'],
  });

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;

// PUT /api/internships/:id (solo profesor).
// studentId es inmutable tras la creación: .strict() lo rechaza con 400 si viaja
// en el body. teacherId es reasignable (se revalida como rol TEACHER en el service).
export const updateInternshipSchema = z
  .object({
    companyName: z.string().trim().min(1).max(200).optional(),
    companyAddress: z.string().trim().min(1).max(300).optional(),
    companyPhone: z.string().trim().min(1).max(50).optional(),
    bossName: z.string().trim().min(1).max(200).optional(),
    bossContact: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
    teacherId: z.string().min(1).optional(),
    status: internshipStatusSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.startDate === undefined || data.endDate === undefined || data.endDate >= data.startDate,
    {
      message: 'endDate debe ser mayor o igual a startDate',
      path: ['endDate'],
    },
  );

export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;

// Params de rutas con :id.
export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'id es obligatorio'),
});

export type IdParam = z.infer<typeof idParamSchema>;

// Query de GET /api/internships (paginado + filtros).
// El service rechaza studentId cuando quien consulta es un STUDENT.
export const listInternshipsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: internshipStatusSchema.optional(),
  companyName: z.string().trim().optional(),
  studentId: z.string().min(1).optional(),
});

export type ListInternshipsQuery = z.infer<typeof listInternshipsQuerySchema>;
