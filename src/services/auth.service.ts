import bcrypt from 'bcryptjs';
import { HttpError } from '../errors.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { userModel } from '../models/user.model.js';

const BCRYPT_ROUNDS = 10;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const authService = {
  /**
   * Registro público: siempre crea un usuario rol STUDENT.
   * El rol nunca viene del body; major es opcional (solo estudiantes).
   */
  async register(input: RegisterInput) {
    const email = normalizeEmail(input.email);

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new HttpError(400, 'Ya existe una cuenta con ese email');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    return userModel.create({
      name: input.name,
      email,
      passwordHash,
      role: 'STUDENT',
      major: input.major ?? null,
    });
  },

  /** Login: mismo mensaje para email inexistente o contraseña incorrecta (no revela cuentas). */
  async login(input: LoginInput) {
    const email = normalizeEmail(input.email);
    const user = await userModel.findByEmail(email);

    if (!user) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      throw new HttpError(401, 'Credenciales inválidas');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      major: user.major,
    };
  },
};
