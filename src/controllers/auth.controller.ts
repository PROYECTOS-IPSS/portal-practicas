import type { Request, RequestHandler, Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

// express-session expone regenerate/destroy solo con callback; aquí se promisifican.
const regenerateSession = (req: Request): Promise<void> =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err: unknown) => (err ? reject(err) : resolve()));
  });

const destroySession = (req: Request): Promise<void> =>
  new Promise((resolve, reject) => {
    req.session.destroy((err: unknown) => (err ? reject(err) : resolve()));
  });

/** Regenera la sesión (anti session-fixation) y fija la identidad del usuario. */
const establishSession = async (req: Request, user: { id: string; role: string }) => {
  await regenerateSession(req);
  req.session.userId = user.id;
  req.session.role = user.role as 'STUDENT' | 'TEACHER';
};

export const authController = {
  // POST /api/auth/register — público. Registro + sesión iniciada (Dashboard directo).
  register: (async (req: Request, res: Response) => {
    const input = req.body as RegisterInput;
    const user = await authService.register(input);
    await establishSession(req, user);
    res.status(201).json(user);
  }) as RequestHandler,

  // POST /api/auth/login — público.
  login: (async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const user = await authService.login(input);
    await establishSession(req, user);
    res.status(200).json(user);
  }) as RequestHandler,

  // POST /api/auth/logout — requiere sesión.
  logout: (async (req: Request, res: Response) => {
    await destroySession(req);
    res.status(200).json({ message: 'Sesión cerrada' });
  }) as RequestHandler,

  // GET /api/auth/session — requiere sesión; devuelve el usuario autenticado.
  sessionInfo: (async (req: Request, res: Response) => {
    const user = await authService.getSessionUser(req.session.userId!);
    res.status(200).json(user);
  }) as RequestHandler,
};
