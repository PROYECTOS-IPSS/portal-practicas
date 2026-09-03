import { z } from 'zod';

// Registro público: siempre crea un estudiante (rol STUDENT lo fija el server,
// nunca viene del body). major es opcional y solo aplica a estudiantes.
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  email: z.email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(200),
  major: z.string().trim().min(1, 'La carrera no puede ir vacía').max(200).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria').max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
