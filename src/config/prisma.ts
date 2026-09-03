import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('Falta DATABASE_URL en el entorno (.env)');
}

// Prisma 7 requiere driver adapter; el pool se crea bajo demanda.
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
