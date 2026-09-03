import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../src/schemas/auth.schema';

describe('registerSchema', () => {
  it('acepta un registro válido de estudiante', () => {
    const result = registerSchema.parse({
      name: 'Ana Torres',
      email: 'ana@mail.com',
      password: 'secreta123',
      major: 'Telecomunicaciones',
    });
    expect(result).toEqual({
      name: 'Ana Torres',
      email: 'ana@mail.com',
      password: 'secreta123',
      major: 'Telecomunicaciones',
    });
  });

  it('major es opcional', () => {
    const result = registerSchema.parse({
      name: 'Ana',
      email: 'ana@mail.com',
      password: 'secreta123',
    });
    expect(result.major).toBeUndefined();
  });

  it('ignora un role enviado en el body (el rol lo fija el server)', () => {
    const result = registerSchema.parse({
      name: 'Ana',
      email: 'ana@mail.com',
      password: 'secreta123',
      role: 'TEACHER',
    });
    expect(result).not.toHaveProperty('role');
  });

  it('rechaza un email inválido', () => {
    expect(() =>
      registerSchema.parse({ name: 'Ana', email: 'no-es-email', password: 'secreta123' }),
    ).toThrow(/Email inválido/);
  });

  it('rechaza una contraseña de menos de 8 caracteres', () => {
    expect(() =>
      registerSchema.parse({ name: 'Ana', email: 'ana@mail.com', password: 'corta' }),
    ).toThrow(/al menos 8 caracteres/);
  });

  it('rechaza nombre vacío o solo espacios', () => {
    expect(() =>
      registerSchema.parse({ name: '   ', email: 'ana@mail.com', password: 'secreta123' }),
    ).toThrow(/El nombre es obligatorio/);
  });

  it('rechaza major vacío cuando se envía', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Ana',
        email: 'ana@mail.com',
        password: 'secreta123',
        major: '  ',
      }),
    ).toThrow(/no puede ir vacía/);
  });
});

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.parse({ email: 'ana@mail.com', password: 'secreta123' });
    expect(result).toEqual({ email: 'ana@mail.com', password: 'secreta123' });
  });

  it('rechaza email inválido', () => {
    expect(() => loginSchema.parse({ email: 'x', password: 'secreta123' })).toThrow(
      /Email inválido/,
    );
  });

  it('rechaza contraseña ausente', () => {
    expect(() => loginSchema.parse({ email: 'ana@mail.com' })).toThrow();
  });
});
