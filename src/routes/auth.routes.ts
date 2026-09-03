import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const router = Router();

// Únicas rutas públicas del sistema: registro y login.
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// El resto del recurso requiere sesión activa.
router.post('/logout', requireAuth, authController.logout);
router.get('/session', requireAuth, authController.sessionInfo);

export default router;
