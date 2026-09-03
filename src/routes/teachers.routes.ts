import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Cualquier usuario autenticado puede ver la lista de profesores (supervisores).
router.get('/', requireAuth, userController.listTeachers);

export default router;
