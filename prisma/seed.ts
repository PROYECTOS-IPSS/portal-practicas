// Seed: cuentas de profesor precargadas (no existe registro público de TEACHER).
// Ejecutar: yarn prisma db seed  (requiere la BD migrada y .env con DATABASE_URL)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

// Contraseña inicial de demostración para todos los profesores del seed.
const TEACHER_PASSWORD = 'profesor123';

const teachers = [
  { name: 'María González', email: 'maria.gonzalez@colegio.cl' },
  { name: 'Carlos Pérez', email: 'carlos.perez@colegio.cl' },
  { name: 'Lucía Fernández', email: 'lucia.fernandez@colegio.cl' },
];

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('Falta DATABASE_URL en el entorno (.env)');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const passwordHash = await bcrypt.hash(TEACHER_PASSWORD, 10);

  for (const teacher of teachers) {
    await prisma.user.upsert({
      where: { email: teacher.email },
      update: {}, // no pisa datos si el profesor ya existe
      create: {
        name: teacher.name,
        email: teacher.email,
        passwordHash,
        role: 'TEACHER',
        major: null,
      },
    });
    console.log(`Profesor listo: ${teacher.name} <${teacher.email}>`);
  }
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
