// Seed principal — datos de demostración del Portal de Prácticas.
// Ejecutar: yarn prisma db seed  (requiere la BD migrada y .env con DATABASE_URL)
//
// Idempotente:
// - Usuarios: upsert por email (no pisa datos existentes).
// - Prácticas demo: solo se insertan si no existe una idéntica
//   (mismo estudiante + empresa + fecha de inicio).
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { InternshipStatus } from '../src/generated/prisma/enums.js';

// Contraseñas de demostración de las cuentas precargadas.
const TEACHER_PASSWORD = 'profesor123';
const STUDENT_PASSWORD = 'egresado123';

const teachers = [
  { name: 'María González', email: 'maria.gonzalez@colegio.cl' },
  { name: 'Carlos Pérez', email: 'carlos.perez@colegio.cl' },
  { name: 'Lucía Fernández', email: 'lucia.fernandez@colegio.cl' },
];

const students = [
  { name: 'Joaquín Rojas', email: 'joaquin.rojas@alumno.cl', major: 'Telecomunicaciones' },
  { name: 'Valentina Soto', email: 'valentina.soto@alumno.cl', major: 'Programación' },
  { name: 'Benjamín Cifuentes', email: 'benjamin.cifuentes@alumno.cl', major: 'Redes y Seguridad' },
];

type SeedInternship = {
  studentEmail: string;
  teacherEmail: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  bossName: string;
  bossContact: string;
  startDate: string;
  endDate: string;
  description: string;
  status: InternshipStatus;
};

// Estado mezclado a propósito: 1 ACTIVA, 2 FINALIZADA, 3 EVALUADA,
// para ejercitar filtros, paginación y transiciones de estado.
const internships: SeedInternship[] = [
  {
    studentEmail: 'joaquin.rojas@alumno.cl',
    teacherEmail: 'maria.gonzalez@colegio.cl',
    companyName: 'Telecom Sur Ltda.',
    companyAddress: 'Av. Matta 845, Concepción',
    companyPhone: '+56 41 2 555 111',
    bossName: 'Patricia Fuentes',
    bossContact: 'pfuentes@telecomsur.cl',
    startDate: '2025-03-03',
    endDate: '2025-08-29',
    description: 'Soporte a clientes residenciales y mantención de enlaces de fibra óptica.',
    status: 'EVALUADA',
  },
  {
    studentEmail: 'joaquin.rojas@alumno.cl',
    teacherEmail: 'maria.gonzalez@colegio.cl',
    companyName: 'Fibra Andina SpA',
    companyAddress: 'Los Carrera 220, Chillán',
    companyPhone: '+56 42 2 333 444',
    bossName: 'Rodrigo Núñez',
    bossContact: 'rnunez@fibraandina.cl',
    startDate: '2026-09-01',
    endDate: '2027-02-28',
    description: 'Despliegue y certificación de red GPON en sectores urbanos.',
    status: 'ACTIVA',
  },
  {
    studentEmail: 'valentina.soto@alumno.cl',
    teacherEmail: 'carlos.perez@colegio.cl',
    companyName: 'Softlandia SPA',
    companyAddress: 'Av. O’Higgins 150, Concepción',
    companyPhone: '+56 41 2 900 200',
    bossName: 'Carla Espinoza',
    bossContact: 'cespinoza@softlandia.cl',
    startDate: '2025-01-06',
    endDate: '2025-06-27',
    description: 'Desarrollo de módulos web con React en el sistema interno de la empresa.',
    status: 'EVALUADA',
  },
  {
    studentEmail: 'valentina.soto@alumno.cl',
    teacherEmail: 'carlos.perez@colegio.cl',
    companyName: 'DataCore Chile',
    companyAddress: 'Freire 310, Talca',
    companyPhone: '+56 71 2 410 500',
    bossName: 'Mauricio Lara',
    bossContact: 'mlara@datacore.cl',
    startDate: '2026-03-02',
    endDate: '2026-08-28',
    description: 'Automatización de procesos de respaldo y monitoreo de servidores.',
    status: 'FINALIZADA',
  },
  {
    studentEmail: 'benjamin.cifuentes@alumno.cl',
    teacherEmail: 'lucia.fernandez@colegio.cl',
    companyName: 'NetSecure Consultores',
    companyAddress: 'Balmaceda 900, Los Ángeles',
    companyPhone: '+56 43 2 770 330',
    bossName: 'Andrea Rivas',
    bossContact: 'arivas@netsecure.cl',
    startDate: '2024-08-05',
    endDate: '2024-12-20',
    description: 'Auditoría de seguridad perimetral y hardening de equipos de red.',
    status: 'EVALUADA',
  },
  {
    studentEmail: 'benjamin.cifuentes@alumno.cl',
    teacherEmail: 'lucia.fernandez@colegio.cl',
    companyName: 'RedLan Empresas',
    companyAddress: 'Freire 145, Temuco',
    companyPhone: '+56 45 2 220 110',
    bossName: 'Sebastián Parra',
    bossContact: 'sparra@redlan.cl',
    startDate: '2025-07-07',
    endDate: '2025-12-19',
    description: 'Administración de red LAN/WLAN y mesa de ayuda en terreno.',
    status: 'FINALIZADA',
  },
];

const toUtcDate = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('Falta DATABASE_URL en el entorno (.env)');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const teacherHash = await bcrypt.hash(TEACHER_PASSWORD, 10);
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);

  // Profesores (no existe registro público de TEACHER).
  for (const teacher of teachers) {
    await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: { name: teacher.name, email: teacher.email, passwordHash: teacherHash, role: 'TEACHER', major: null },
    });
  }
  console.log(`Profesores listos: ${teachers.length}`);

  // Estudiantes de demostración.
  for (const student of students) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        name: student.name,
        email: student.email,
        passwordHash: studentHash,
        role: 'STUDENT',
        major: student.major,
      },
    });
  }
  console.log(`Estudiantes listos: ${students.length}`);

  // Prácticas demo (solo si no existe una idéntica ya cargada).
  let created = 0;
  let skipped = 0;
  for (const data of internships) {
    const student = await prisma.user.findUnique({ where: { email: data.studentEmail } });
    const teacher = await prisma.user.findUnique({ where: { email: data.teacherEmail } });
    if (!student || !teacher) {
      console.warn(`Omitida: faltan usuarios para ${data.companyName}`);
      continue;
    }

    const exists = await prisma.internshipRecord.findFirst({
      where: { studentId: student.id, companyName: data.companyName, startDate: toUtcDate(data.startDate) },
    });
    if (exists) {
      skipped += 1;
      continue;
    }

    await prisma.internshipRecord.create({
      data: {
        studentId: student.id,
        teacherId: teacher.id,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        bossName: data.bossName,
        bossContact: data.bossContact,
        startDate: toUtcDate(data.startDate),
        endDate: toUtcDate(data.endDate),
        description: data.description,
        status: data.status,
      },
    });
    created += 1;
  }

  console.log(`Prácticas demo: ${created} creadas, ${skipped} ya existían.`);
  console.log('Seed completado.');
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
