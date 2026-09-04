import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('Falta DATABASE_URL en el entorno (.env)');
}

// Prisma 7 requiere driver adapter; el pool se crea bajo demanda.
// Timeouts explícitos: equivalen a los defaults de Prisma v6 (más robustos que
// los de v7: connectionTimeout 0 e idle 10s).
export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  }),
});
