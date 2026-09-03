import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireTeacher } from '../middleware/rbac.middleware.js';

const router = Router();

// Solo los profesores pueden listar estudiantes (selector al crear prácticas).
router.get('/', requireTeacher, userController.listStudents);

export default router;
