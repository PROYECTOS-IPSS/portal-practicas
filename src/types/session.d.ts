import type { UserRole } from '../generated/prisma/enums.js';

// Datos de sesión accesibles como req.session.userId / req.session.role.
// El rol siempre lo escribe el servidor al autenticar (nunca el cliente).
declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: UserRole;
  }
}
